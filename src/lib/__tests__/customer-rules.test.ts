import { describe, it, expect } from 'vitest';
import {
  getFollowUpRisk,
  isNeedsAttention,
  matchesAllFilters,
} from '../customer-rules';
import { Customer } from '@/types/customer';

describe('Customer Rules Engine', () => {
  describe('getFollowUpRisk', () => {
    it('returns "low" for contacts within 0 to 7 calendar days', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(getFollowUpRisk(today)).toBe('low');

      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(fiveDaysAgo)).toBe('low');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(sevenDaysAgo)).toBe('low');
    });

    it('returns "medium" for contacts between 8 and 30 calendar days', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(eightDaysAgo)).toBe('medium');

      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(twentyDaysAgo)).toBe('medium');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(thirtyDaysAgo)).toBe('medium');
    });

    it('returns "high" for contacts older than 30 calendar days', () => {
      const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(thirtyOneDaysAgo)).toBe('high');

      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      expect(getFollowUpRisk(sixtyDaysAgo)).toBe('high');
    });
  });

  describe('isNeedsAttention', () => {
    it('returns true ONLY when customer is active AND has high follow-up risk', () => {
      const activeHighRisk: Customer = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        phone: '+1 555 123 4567',
        company: 'Acme',
        status: 'active',
        lastContactDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      expect(isNeedsAttention(activeHighRisk)).toBe(true);
    });

    it('returns false when customer is inactive even with high risk', () => {
      const inactiveHighRisk: Customer = {
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        phone: '+1 555 123 4567',
        company: 'Acme',
        status: 'inactive',
        lastContactDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      expect(isNeedsAttention(inactiveHighRisk)).toBe(false);
    });

    it('returns false when customer is active with low or medium risk', () => {
      const activeLowRisk: Customer = {
        id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
        phone: '+1 555 123 4567',
        company: 'Acme',
        status: 'active',
        lastContactDate: new Date().toISOString().split('T')[0],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      expect(isNeedsAttention(activeLowRisk)).toBe(false);
    });
  });

  describe('matchesAllFilters', () => {
    const customer: Customer = {
      id: 'c1',
      name: 'Eleanor Vance',
      email: 'eleanor@hillhouse.org',
      phone: '+1 555 987 6543',
      company: 'Hill House Corp',
      status: 'active',
      lastContactDate: '2026-08-01',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    it('matches by search string against name, email, or company', () => {
      expect(matchesAllFilters(customer, { search: 'eleanor' })).toBe(true);
      expect(matchesAllFilters(customer, { search: 'hillhouse' })).toBe(true);
      expect(matchesAllFilters(customer, { search: 'random query' })).toBe(false);
    });

    it('matches by status filter', () => {
      expect(matchesAllFilters(customer, { status: ['active'] })).toBe(true);
      expect(matchesAllFilters(customer, { status: ['inactive'] })).toBe(false);
    });

    it('matches by company filter', () => {
      expect(matchesAllFilters(customer, { company: ['Hill House Corp'] })).toBe(true);
      expect(matchesAllFilters(customer, { company: ['Other Corp'] })).toBe(false);
    });
  });
});
