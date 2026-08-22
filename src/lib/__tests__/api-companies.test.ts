import { describe, it, expect, beforeEach } from 'vitest';
import {
  listCompanies,
  getCompany,
  getCompanyOptions,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../api/companies';
import { resetMockCompaniesStore } from '@/data/mock-companies';

describe('Company API Service Layer', () => {
  beforeEach(() => {
    resetMockCompaniesStore();
  });

  it('fetches paginated companies with computed contact stats', async () => {
    const res = await listCompanies({ page: 1, pageSize: 10 });
    expect(res.data).toBeDefined();
    expect(res.data.length).toBeLessThanOrEqual(10);
    expect(res.total).toBeGreaterThan(0);
    expect(res.page).toBe(1);

    // Verify stats fields are calculated
    const first = res.data[0];
    expect(first.id).toBeDefined();
    expect(typeof first.totalContacts).toBe('number');
    expect(typeof first.activeContacts).toBe('number');
    expect(typeof first.highRiskContacts).toBe('number');
  });

  it('filters companies by search, industry, and tier', async () => {
    const searchRes = await listCompanies({ search: 'Tech' });
    expect(searchRes.data.length).toBeGreaterThan(0);

    const techRes = await listCompanies({ industry: ['Technology'] });
    expect(techRes.data.every((c) => c.industry === 'Technology')).toBe(true);

    const enterpriseRes = await listCompanies({ tier: ['Enterprise'] });
    expect(enterpriseRes.data.every((c) => c.tier === 'Enterprise')).toBe(true);
  });

  it('fetches single company with full list of linked contacts', async () => {
    const listRes = await listCompanies({ page: 1, pageSize: 5 });
    const target = listRes.data[0];

    const company = await getCompany(target.id);
    expect(company).toBeDefined();
    expect(company?.id).toBe(target.id);
    expect(company?.contacts).toBeDefined();
    expect(Array.isArray(company?.contacts)).toBe(true);
  });

  it('creates, updates, and deletes a company record', async () => {
    // Create
    const created = await createCompany({
      name: 'Test Acme Space',
      industry: 'Technology',
      tier: 'Startup',
      location: 'Houston, TX',
      website: 'https://acmespace.io',
      description: 'Aerospace satellite telematics and payload tracking.',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Acme Space');
    expect(created.tier).toBe('Startup');

    // Update
    const updated = await updateCompany(created.id, {
      tier: 'Mid-Market',
      location: 'Austin, TX',
    });

    expect(updated.tier).toBe('Mid-Market');
    expect(updated.location).toBe('Austin, TX');

    // Delete
    const deleteRes = await deleteCompany(created.id);
    expect(deleteRes.success).toBe(true);

    const fetched = await getCompany(created.id);
    expect(fetched).toBeNull();
  });

  it('fetches clean dropdown options', async () => {
    const options = await getCompanyOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].name).toBeDefined();
    expect(options[0].tier).toBeDefined();
  });
});
