import { describe, it, expect } from 'vitest';
import { customerFormSchema } from '../validations/customer';

describe('Customer Form Validation Schema (Zod)', () => {
  const validPayload = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 555 123 4567',
    company: 'Acme Global',
    status: 'active' as const,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: 'Initial account setup completed.',
  };

  it('validates a correct customer payload without errors', () => {
    const result = customerFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects empty customer names', () => {
    const result = customerFormSchema.safeParse({
      ...validPayload,
      name: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Customer name is required');
    }
  });

  it('rejects invalid email formats', () => {
    const result = customerFormSchema.safeParse({
      ...validPayload,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('rejects future last contact dates', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000 * 2)
      .toISOString()
      .split('T')[0];

    const result = customerFormSchema.safeParse({
      ...validPayload,
      lastContactDate: tomorrow,
    });
    expect(result.success).toBe(false);
  });
});
