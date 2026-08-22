/**
 * Centralized Query Keys Factory.
 * Sole source of truth for all TanStack Query key array definitions.
 * Hand-writing array literal query keys anywhere else is strictly disallowed.
 */

export interface CustomerListParams {
  search?: string;
  sortBy?: 'name' | 'email' | 'lastContactDate' | 'followUpRisk';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  status?: string[];
  company?: string[];
  risk?: string[];
  lastContactFrom?: string;
  lastContactTo?: string;
  phone?: string;
  email?: string;
}

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: CustomerListParams) => [...customerKeys.lists(), params ?? {}] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
};
