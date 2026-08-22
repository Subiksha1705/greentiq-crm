import { Customer, CustomerFilterState, RiskLevel } from '@/types/customer';
import { toCalendarDate, getCalendarDaysDifference } from './utils';

/**
 * Computes Follow-up Risk level based on last contact date.
 * 
 * Rules (§2.1):
 * - Contact-recency rule, not a prediction — do not rename to AI/ML anything.
 * - Derived from whole calendar-day difference ignoring time-of-day.
 * - Buckets:
 *     0–7 days   => 'low'
 *     8–30 days  => 'medium'
 *     31+ days   => 'high'
 * - Defensive fallback: If a future date is encountered, daysSinceContact is clamped to 0 ('low').
 */
export function getFollowUpRisk(lastContactDate: Date | string, relativeTo: Date = new Date()): RiskLevel {
  const diffDays = getCalendarDaysDifference(lastContactDate, relativeTo);

  // Clamp future dates to 0 (never negative)
  const daysSinceContact = Math.max(0, diffDays);

  if (daysSinceContact <= 7) {
    return 'low';
  }
  if (daysSinceContact <= 30) {
    return 'medium';
  }
  return 'high';
}

/**
 * Determines whether a customer needs immediate attention.
 * §2.1: Status must be 'active' AND Follow-up Risk must be 'high'.
 */
export function isNeedsAttention(customer: Customer, relativeTo: Date = new Date()): boolean {
  if (customer.status !== 'active') return false;
  return getFollowUpRisk(customer.lastContactDate, relativeTo) === 'high';
}

/**
 * Risk rank index mapping for sorting.
 * §3 & §15: Follow-up Risk sort order is low < medium < high (0 < 1 < 2), never alphabetical string sort.
 */
export const RISK_RANK_MAP: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

/**
 * Global search predicate.
 * Case-insensitive, trimmed substring match across Name, Email, and Company.
 */
export function matchesSearch(customer: Customer, searchQuery?: string): boolean {
  if (!searchQuery) return true;
  const trimmed = searchQuery.trim().toLowerCase();
  if (!trimmed) return true;

  return (
    customer.name.toLowerCase().includes(trimmed) ||
    customer.email.toLowerCase().includes(trimmed) ||
    customer.company.toLowerCase().includes(trimmed)
  );
}

/**
 * Status filter predicate (OR within status list).
 */
export function matchesStatusFilter(customer: Customer, statusList?: string[]): boolean {
  if (!statusList || statusList.length === 0) return true;
  return statusList.includes(customer.status);
}

/**
 * Company filter predicate (OR within company list).
 */
export function matchesCompanyFilter(customer: Customer, companyList?: string[]): boolean {
  if (!companyList || companyList.length === 0) return true;
  return companyList.includes(customer.company);
}

/**
 * Risk filter predicate (OR within risk level list).
 */
export function matchesRiskFilter(
  customer: Customer,
  riskList?: RiskLevel[],
  relativeTo: Date = new Date()
): boolean {
  if (!riskList || riskList.length === 0) return true;
  const currentRisk = getFollowUpRisk(customer.lastContactDate, relativeTo);
  return riskList.includes(currentRisk);
}

/**
 * Date range filter predicate.
 * Inclusive on both boundaries, comparing normalized local calendar dates.
 */
export function matchesDateRangeFilter(
  customer: Customer,
  fromDateStr?: string,
  toDateStr?: string
): boolean {
  if (!fromDateStr && !toDateStr) return true;

  const contactDate = toCalendarDate(customer.lastContactDate);

  if (fromDateStr) {
    const fromDate = toCalendarDate(fromDateStr);
    if (contactDate < fromDate) return false;
  }

  if (toDateStr) {
    const toDate = toCalendarDate(toDateStr);
    if (contactDate > toDate) return false;
  }

  return true;
}

/**
 * Field-specific Email and Phone filter predicates.
 * Case-insensitive substring match.
 */
export function matchesExactFieldFilter(
  customer: Customer,
  emailFilter?: string,
  phoneFilter?: string
): boolean {
  if (emailFilter && emailFilter.trim()) {
    if (!customer.email.toLowerCase().includes(emailFilter.trim().toLowerCase())) {
      return false;
    }
  }

  if (phoneFilter && phoneFilter.trim()) {
    const cleanedPhoneFilter = phoneFilter.replace(/\D/g, '');
    const cleanedCustomerPhone = customer.phone.replace(/\D/g, '');
    if (cleanedPhoneFilter && !cleanedCustomerPhone.includes(cleanedPhoneFilter)) {
      return false;
    }
  }

  return true;
}

/**
 * Combined filter predicate matching all active filters with AND semantics.
 */
export function matchesAllFilters(
  customer: Customer,
  filters: CustomerFilterState,
  relativeTo: Date = new Date()
): boolean {
  if (!matchesSearch(customer, filters.search)) return false;
  if (!matchesStatusFilter(customer, filters.status)) return false;
  if (!matchesCompanyFilter(customer, filters.company)) return false;
  if (!matchesRiskFilter(customer, filters.risk, relativeTo)) return false;
  if (!matchesDateRangeFilter(customer, filters.lastContactFrom, filters.lastContactTo)) return false;
  if (!matchesExactFieldFilter(customer, filters.email, filters.phone)) return false;

  return true;
}
