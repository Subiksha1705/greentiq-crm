import {
  Customer,
  CustomerListParams,
  CustomerStats,
  CreateCustomerInput,
  UpdateCustomerInput,
  PaginatedCustomerResult,
} from '@/types/customer';
import { MOCK_CUSTOMERS_STORE } from '@/data/mock-customers';
import {
  getFollowUpRisk,
  isNeedsAttention,
  matchesAllFilters,
  RISK_RANK_MAP,
} from '../customer-rules';
import { toCalendarDate } from '../utils';

// Deterministic error mode state (§5.2)
type ErrorMode = 'off' | 'next' | 'all';
let currentErrorMode: ErrorMode = 'off';

/**
 * Sets the mock API error mode for testing.
 * - 'off': normal operation (default, zero random failures)
 * - 'next': next service call rejects, then resets to 'off'
 * - 'all': all service calls reject until set back to 'off'
 */
export function setMockApiErrorMode(mode: ErrorMode): void {
  currentErrorMode = mode;
}

export function getMockApiErrorMode(): ErrorMode {
  return currentErrorMode;
}

/**
 * Checks and enforces error injection rules before executing any mock API operation.
 */
function checkErrorInjection(): void {
  if (currentErrorMode === 'all') {
    throw new Error('Mock API Error: Service unavailable (mode: all)');
  }
  if (currentErrorMode === 'next') {
    currentErrorMode = 'off'; // Auto-reset after single failure
    throw new Error('Mock API Error: Request failed (mode: next)');
  }
}

/**
 * Simulates async network delay (300ms - 600ms).
 */
function simulateLatency(): Promise<void> {
  const ms = 300 + Math.floor(Math.random() * 300);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lists customers with full filter, search, sort, and pagination support.
 */
export async function listCustomers(params: CustomerListParams = {}): Promise<PaginatedCustomerResult> {
  await simulateLatency();
  checkErrorInjection();

  const {
    page = 1,
    pageSize = 10,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  // 1. Filter full dataset
  let filtered = MOCK_CUSTOMERS_STORE.filter((customer) => matchesAllFilters(customer, params));

  // 2. Sort dataset
  filtered.sort((a, b) => {
    let result = 0;

    if (sortBy === 'name') {
      result = a.name.localeCompare(b.name);
    } else if (sortBy === 'email') {
      result = a.email.localeCompare(b.email);
    } else if (sortBy === 'lastContactDate') {
      const dateA = toCalendarDate(a.lastContactDate).getTime();
      const dateB = toCalendarDate(b.lastContactDate).getTime();
      result = dateA - dateB;
    } else if (sortBy === 'followUpRisk') {
      // Sort by rank index (low=0, medium=1, high=2), never string compare
      const rankA = RISK_RANK_MAP[getFollowUpRisk(a.lastContactDate)];
      const rankB = RISK_RANK_MAP[getFollowUpRisk(b.lastContactDate)];
      result = rankA - rankB;
    }

    return sortOrder === 'desc' ? -result : result;
  });

  // 3. Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const validPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (validPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    data: paginatedData,
    total,
    page: validPage,
    pageSize,
    totalPages,
  };
}

/**
 * Gets a single customer by ID.
 */
export async function getCustomer(id: string): Promise<Customer | null> {
  await simulateLatency();
  checkErrorInjection();

  const customer = MOCK_CUSTOMERS_STORE.find((c) => c.id === id);
  return customer ? { ...customer } : null;
}

/**
 * Creates a new customer.
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  await simulateLatency();
  checkErrorInjection();

  const nowISO = new Date().toISOString().split('T')[0];

  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    status: input.status,
    lastContactDate: input.lastContactDate,
    notes: input.notes,
    interactions: [
      {
        id: `int-${Date.now()}`,
        type: 'note',
        summary: 'Customer record created.',
        date: input.lastContactDate,
      },
    ],
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  MOCK_CUSTOMERS_STORE.unshift(newCustomer);
  return { ...newCustomer };
}

/**
 * Updates an existing customer.
 */
export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  await simulateLatency();
  checkErrorInjection();

  const index = MOCK_CUSTOMERS_STORE.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Customer with ID "${id}" not found.`);
  }

  const existing = MOCK_CUSTOMERS_STORE[index];
  const nowISO = new Date().toISOString().split('T')[0];

  // Check if last contact date is being updated to append interaction entry
  const isDateUpdated = input.lastContactDate && input.lastContactDate !== existing.lastContactDate;

  const updatedCustomer: Customer = {
    ...existing,
    ...input,
    updatedAt: nowISO,
    interactions: isDateUpdated
      ? [
          {
            id: `int-${Date.now()}`,
            type: 'call',
            summary: `Last contact updated to ${input.lastContactDate}.`,
            date: input.lastContactDate!,
          },
          ...(existing.interactions || []),
        ]
      : existing.interactions,
  };

  MOCK_CUSTOMERS_STORE[index] = updatedCustomer;
  return { ...updatedCustomer };
}

/**
 * Deletes a customer.
 */
export async function deleteCustomer(id: string): Promise<{ success: boolean }> {
  await simulateLatency();
  checkErrorInjection();

  const index = MOCK_CUSTOMERS_STORE.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Customer with ID "${id}" not found.`);
  }

  MOCK_CUSTOMERS_STORE.splice(index, 1);
  return { success: true };
}

/**
 * Computes portfolio KPIs over the FULL dataset (never a paginated slice).
 * §5.2: getCustomerStats().needsAttention MUST call isNeedsAttention() per customer.
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  await simulateLatency();
  checkErrorInjection();

  const total = MOCK_CUSTOMERS_STORE.length;
  let active = 0;
  let inactive = 0;
  let needsAttention = 0;

  for (const customer of MOCK_CUSTOMERS_STORE) {
    if (customer.status === 'active') {
      active++;
    } else if (customer.status === 'inactive') {
      inactive++;
    }

    if (isNeedsAttention(customer)) {
      needsAttention++;
    }
  }

  return {
    total,
    active,
    inactive,
    needsAttention,
  };
}
