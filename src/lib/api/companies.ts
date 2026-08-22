import {
  Company,
  CompanyWithStats,
  CreateCompanyInput,
  UpdateCompanyInput,
  CompanyListParams,
  PaginatedCompanyResult,
} from '@/types/company';
import { MOCK_COMPANIES_STORE } from '@/data/mock-companies';
import { MOCK_CUSTOMERS_STORE } from '@/data/mock-customers';
import { getFollowUpRisk } from '@/lib/customer-rules';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculates aggregated contact statistics for a company with defensive null safety.
 */
function enrichCompanyWithStats(company: Company, includeContacts: boolean = false): CompanyWithStats {
  const targetName = (company.name || '').toLowerCase().trim();
  const contacts = MOCK_CUSTOMERS_STORE.filter(
    (c) => (c.company || '').toLowerCase().trim() === targetName
  );

  const totalContacts = contacts.length;
  const activeContacts = contacts.filter((c) => c.status === 'active').length;
  
  let highRiskCount = 0;
  contacts.forEach((c) => {
    try {
      const risk = getFollowUpRisk(c.lastContactDate || new Date());
      if (risk === 'high') {
        highRiskCount++;
      }
    } catch {
      // Ignore calculation error fallback
    }
  });

  return {
    ...company,
    totalContacts,
    activeContacts,
    highRiskContacts: highRiskCount,
    contacts: includeContacts ? contacts : undefined,
  };
}

/**
 * List companies with search, industry filter, tier filter, sorting, and pagination.
 */
export async function listCompanies(params?: CompanyListParams): Promise<PaginatedCompanyResult> {
  await delay(120);

  const {
    search,
    industry,
    tier,
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    pageSize = 10,
  } = params || {};

  let result = MOCK_COMPANIES_STORE.map((c) => enrichCompanyWithStats(c, false));

  // Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }

  // Industry filter
  if (industry && industry.length > 0) {
    result = result.filter((c) => industry.includes(c.industry));
  }

  // Tier filter
  if (tier && tier.length > 0) {
    result = result.filter((c) => tier.includes(c.tier));
  }

  // Sorting
  result.sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') {
      cmp = (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'industry') {
      cmp = (a.industry || '').localeCompare(b.industry || '');
    } else if (sortBy === 'tier') {
      cmp = (a.tier || '').localeCompare(b.tier || '');
    } else if (sortBy === 'totalContacts') {
      cmp = a.totalContacts - b.totalContacts;
    } else if (sortBy === 'activeContacts') {
      cmp = a.activeContacts - b.activeContacts;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const total = result.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const validPage = Math.min(Math.max(1, page), totalPages);
  const start = (validPage - 1) * pageSize;
  const paginatedData = result.slice(start, start + pageSize);

  return {
    data: paginatedData,
    total,
    page: validPage,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single company with full list of linked contacts.
 */
export async function getCompany(id: string): Promise<CompanyWithStats | null> {
  await delay(100);

  const found = MOCK_COMPANIES_STORE.find((c) => c.id === id);
  if (!found) return null;

  return enrichCompanyWithStats(found, true);
}

/**
 * Fast lookup of all distinct company options for dropdowns across the application.
 */
export async function getCompanyOptions(): Promise<{ id: string; name: string; industry: string; tier: string }[]> {
  await delay(40);

  return MOCK_COMPANIES_STORE.map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    tier: c.tier,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Create a new company.
 */
export async function createCompany(input: CreateCompanyInput): Promise<CompanyWithStats> {
  await delay(150);

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error('Company name is required.');
  }

  const existing = MOCK_COMPANIES_STORE.find(
    (c) => c.name.toLowerCase().trim() === trimmedName.toLowerCase()
  );
  if (existing) {
    throw new Error('A company with this name already exists.');
  }

  const now = new Date().toISOString();
  const newCompany: Company = {
    id: `comp-${Date.now()}`,
    name: trimmedName,
    industry: input.industry,
    tier: input.tier,
    website: input.website?.trim() || undefined,
    location: input.location?.trim() || undefined,
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  MOCK_COMPANIES_STORE.unshift(newCompany);
  return enrichCompanyWithStats(newCompany, true);
}

/**
 * Update an existing company.
 * If company name changed, synchronously updates all linked customer records.
 */
export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyWithStats> {
  await delay(150);

  const index = MOCK_COMPANIES_STORE.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Company with ID "${id}" not found.`);
  }

  const existing = MOCK_COMPANIES_STORE[index];
  const oldName = existing.name;

  if (input.name) {
    const trimmed = input.name.trim();
    const duplicate = MOCK_COMPANIES_STORE.find(
      (c) => c.id !== id && c.name.toLowerCase().trim() === trimmed.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`A company with the name "${trimmed}" already exists.`);
    }
  }

  const updated: Company = {
    ...existing,
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.industry ? { industry: input.industry } : {}),
    ...(input.tier ? { tier: input.tier } : {}),
    ...(input.website !== undefined ? { website: input.website.trim() || undefined } : {}),
    ...(input.location !== undefined ? { location: input.location.trim() || undefined } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() || undefined } : {}),
    updatedAt: new Date().toISOString(),
  };

  MOCK_COMPANIES_STORE[index] = updated;

  // Cascade name changes to linked customer records
  if (input.name && input.name.trim() !== oldName) {
    MOCK_CUSTOMERS_STORE.forEach((customer) => {
      if (customer.company.toLowerCase().trim() === oldName.toLowerCase().trim()) {
        customer.company = updated.name;
        customer.updatedAt = new Date().toISOString();
      }
    });
  }

  return enrichCompanyWithStats(updated, true);
}

/**
 * Delete a company.
 */
export async function deleteCompany(id: string): Promise<{ success: boolean; id: string }> {
  await delay(150);

  const index = MOCK_COMPANIES_STORE.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Company with ID "${id}" not found.`);
  }

  const [removed] = MOCK_COMPANIES_STORE.splice(index, 1);
  return { success: true, id: removed.id };
}
