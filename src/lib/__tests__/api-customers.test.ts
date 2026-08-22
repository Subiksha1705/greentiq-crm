import { describe, it, expect } from 'vitest';
import {
  listCustomers,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkUpdateCustomerStatus,
  bulkDeleteCustomers,
  bulkImportCustomers,
} from '../api/customers';

describe('Customer API Service Layer', () => {
  it('fetches paginated customer records', async () => {
    const res = await listCustomers({ page: 1, pageSize: 10 });
    expect(res.data).toBeDefined();
    expect(res.data.length).toBeLessThanOrEqual(10);
    expect(res.total).toBeGreaterThan(0);
    expect(res.page).toBe(1);
  });

  it('calculates full portfolio stats accurately', async () => {
    const stats = await getCustomerStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.active + stats.inactive).toBe(stats.total);
    expect(stats.needsAttention).toBeLessThanOrEqual(stats.active);
    expect(stats.healthScore).toBeGreaterThanOrEqual(0);
    expect(stats.recencyBuckets).toBeDefined();
    expect(stats.topCompanies).toBeDefined();
  });

  it('creates, updates, and deletes a customer record', async () => {
    const initialStats = await getCustomerStats();

    // Create
    const created = await createCustomer({
      name: 'Test Customer Alpha',
      email: 'alpha.test@example.com',
      phone: '+1 555 999 8888',
      company: 'Alpha Corp',
      status: 'active',
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: 'Initial test note',
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Customer Alpha');

    // Update
    const updated = await updateCustomer(created.id, {
      company: 'Alpha Global',
      status: 'inactive',
    });

    expect(updated.company).toBe('Alpha Global');
    expect(updated.status).toBe('inactive');

    // Delete
    const deletedRes = await deleteCustomer(created.id);
    expect(deletedRes.success).toBe(true);

    const postStats = await getCustomerStats();
    expect(postStats.total).toBe(initialStats.total);
  });

  it('handles bulk operations: import, status update, and delete', async () => {
    // Bulk Import
    const importRes = await bulkImportCustomers([
      {
        name: 'Bulk Customer 1',
        email: 'bulk1@test.com',
        phone: '+1 555 000 1111',
        company: 'Bulk Group',
        status: 'active',
        lastContactDate: new Date().toISOString().split('T')[0],
      },
      {
        name: 'Bulk Customer 2',
        email: 'bulk2@test.com',
        phone: '+1 555 000 2222',
        company: 'Bulk Group',
        status: 'active',
        lastContactDate: new Date().toISOString().split('T')[0],
      },
    ]);

    expect(importRes.importedCount).toBe(2);

    const listRes = await listCustomers({ search: 'Bulk Customer' });
    const importedIds = listRes.data.map((c) => c.id);
    expect(importedIds.length).toBeGreaterThanOrEqual(2);

    // Bulk Status Update
    const updateRes = await bulkUpdateCustomerStatus(importedIds, 'inactive');
    expect(updateRes.updatedCount).toBe(importedIds.length);

    // Bulk Delete
    const deleteRes = await bulkDeleteCustomers(importedIds);
    expect(deleteRes.deletedCount).toBe(importedIds.length);
  });
});
