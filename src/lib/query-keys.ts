/**
 * Centralized Query Keys Factory.
 * Sole source of truth for all TanStack Query key array definitions.
 * Hand-writing array literal query keys anywhere else is strictly disallowed.
 */

import { CustomerListParams } from '@/types/customer';
import { CompanyListParams } from '@/types/company';

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: CustomerListParams) => [...customerKeys.lists(), params ?? {}] as const,
  filteredAll: (params?: CustomerListParams) => [...customerKeys.all, 'filteredAll', params ?? {}] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  byIds: (ids: string[]) => [...customerKeys.all, 'byIds', ids] as const,
  filterOptions: () => [...customerKeys.all, 'filterOptions'] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
};

export const companyKeys = {
  all: ['companies'] as const,
  lists: () => [...companyKeys.all, 'list'] as const,
  list: (params?: CompanyListParams) => [...companyKeys.lists(), params ?? {}] as const,
  details: () => [...companyKeys.all, 'detail'] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  options: () => [...companyKeys.all, 'options'] as const,
};


