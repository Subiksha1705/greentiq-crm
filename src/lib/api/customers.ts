import {
  Customer,
  CustomerStatus,
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
import { toCalendarDate, getCalendarDaysDifference } from '../utils';

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

  let nextInteractions = existing.interactions || [];
  if (input.interactions !== undefined) {
    nextInteractions = input.interactions;
  } else if (isDateUpdated) {
    nextInteractions = [
      {
        id: `int-${Date.now()}`,
        type: 'call',
        summary: `Last contact updated to ${input.lastContactDate}.`,
        date: input.lastContactDate!,
      },
      ...nextInteractions,
    ];
  }

  const updatedCustomer: Customer = {
    ...existing,
    ...input,
    interactions: nextInteractions,
    updatedAt: nowISO,
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
 * Bulk updates the status of multiple customers.
 */
export async function bulkUpdateCustomerStatus(
  ids: string[],
  status: CustomerStatus
): Promise<{ updatedCount: number }> {
  await simulateLatency();
  checkErrorInjection();

  const idSet = new Set(ids);
  let updatedCount = 0;
  const nowISO = new Date().toISOString().split('T')[0];

  for (let i = 0; i < MOCK_CUSTOMERS_STORE.length; i++) {
    if (idSet.has(MOCK_CUSTOMERS_STORE[i].id)) {
      MOCK_CUSTOMERS_STORE[i] = {
        ...MOCK_CUSTOMERS_STORE[i],
        status,
        updatedAt: nowISO,
      };
      updatedCount++;
    }
  }

  return { updatedCount };
}

/**
 * Bulk deletes multiple customers.
 */
export async function bulkDeleteCustomers(
  ids: string[]
): Promise<{ deletedCount: number }> {
  await simulateLatency();
  checkErrorInjection();

  const idSet = new Set(ids);
  const initialLength = MOCK_CUSTOMERS_STORE.length;

  for (let i = MOCK_CUSTOMERS_STORE.length - 1; i >= 0; i--) {
    if (idSet.has(MOCK_CUSTOMERS_STORE[i].id)) {
      MOCK_CUSTOMERS_STORE.splice(i, 1);
    }
  }

  const deletedCount = initialLength - MOCK_CUSTOMERS_STORE.length;
  return { deletedCount };
}

/**
 * Bulk imports a batch of customer records.
 */
export async function bulkImportCustomers(
  inputs: CreateCustomerInput[]
): Promise<{ importedCount: number }> {
  await simulateLatency();
  checkErrorInjection();

  const nowISO = new Date().toISOString().split('T')[0];

  const newCustomers: Customer[] = inputs.map((input, index) => ({
    id: `cust-imp-${Date.now()}-${index}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    status: input.status,
    lastContactDate: input.lastContactDate,
    notes: input.notes,
    interactions: [
      {
        id: `int-imp-${Date.now()}-${index}`,
        type: 'note',
        summary: 'Imported via batch dataset upload.',
        date: input.lastContactDate,
      },
    ],
    createdAt: nowISO,
    updatedAt: nowISO,
  }));

  // Prepend to store
  MOCK_CUSTOMERS_STORE.unshift(...newCustomers);

  return { importedCount: newCustomers.length };
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
  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  let highRiskCount = 0;
  let totalDaysDiff = 0;

  // Recency buckets count
  let bucket0to7 = 0;
  let bucket8to14 = 0;
  let bucket15to30 = 0;
  let bucket31to60 = 0;
  let bucket60Plus = 0;

  // Company distribution map
  const companyMap = new Map<string, { count: number; activeCount: number }>();

  for (const customer of MOCK_CUSTOMERS_STORE) {
    if (customer.status === 'active') {
      active++;
    } else if (customer.status === 'inactive') {
      inactive++;
    }

    if (isNeedsAttention(customer)) {
      needsAttention++;
    }

    const risk = getFollowUpRisk(customer.lastContactDate);
    if (risk === 'low') lowRiskCount++;
    else if (risk === 'medium') mediumRiskCount++;
    else if (risk === 'high') highRiskCount++;

    const daysDiff = Math.max(0, getCalendarDaysDifference(customer.lastContactDate));
    totalDaysDiff += daysDiff;

    if (daysDiff <= 7) bucket0to7++;
    else if (daysDiff <= 14) bucket8to14++;
    else if (daysDiff <= 30) bucket15to30++;
    else if (daysDiff <= 60) bucket31to60++;
    else bucket60Plus++;

    if (customer.company) {
      const existing = companyMap.get(customer.company) || { count: 0, activeCount: 0 };
      existing.count += 1;
      if (customer.status === 'active') existing.activeCount += 1;
      companyMap.set(customer.company, existing);
    }
  }

  const avgDaysSinceContact = total > 0 ? Math.round(totalDaysDiff / total) : 0;
  const healthScore = total > 0 ? Math.round((lowRiskCount / total) * 100) : 0;

  const recencyBuckets = [
    {
      range: '0–7 Days',
      label: 'Fresh (Low Risk)',
      count: bucket0to7,
      percentage: total > 0 ? Math.round((bucket0to7 / total) * 100) : 0,
      color: '#16A34A',
    },
    {
      range: '8–14 Days',
      label: 'Recent (Medium Risk)',
      count: bucket8to14,
      percentage: total > 0 ? Math.round((bucket8to14 / total) * 100) : 0,
      color: '#EAB308',
    },
    {
      range: '15–30 Days',
      label: 'Approaching (Medium Risk)',
      count: bucket15to30,
      percentage: total > 0 ? Math.round((bucket15to30 / total) * 100) : 0,
      color: '#F97316',
    },
    {
      range: '31–60 Days',
      label: 'Lapsed (High Risk)',
      count: bucket31to60,
      percentage: total > 0 ? Math.round((bucket31to60 / total) * 100) : 0,
      color: '#EF4444',
    },
    {
      range: '60+ Days',
      label: 'Critical (High Risk)',
      count: bucket60Plus,
      percentage: total > 0 ? Math.round((bucket60Plus / total) * 100) : 0,
      color: '#991B1B',
    },
  ];

  const topCompanies = Array.from(companyMap.entries())
    .map(([company, data]) => ({
      company,
      count: data.count,
      activeCount: data.activeCount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    active,
    inactive,
    needsAttention,
    lowRiskCount,
    mediumRiskCount,
    highRiskCount,
    avgDaysSinceContact,
    healthScore,
    recencyBuckets,
    topCompanies,
  };
}
