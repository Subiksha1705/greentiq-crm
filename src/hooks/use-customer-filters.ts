'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  CustomerFilterState,
  CustomerListParams,
  CustomerSortState,
  CustomerStatus,
  RiskLevel,
} from '@/types/customer';

export function useCustomerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current URL search params into strongly typed CustomerListParams
  const params: CustomerListParams = useMemo(() => {
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as CustomerSortState['sortBy']) || undefined;
    const sortOrder = (searchParams.get('sortOrder') as CustomerSortState['sortOrder']) || undefined;
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const statusParam = searchParams.get('status');
    const status = statusParam ? (statusParam.split(',') as CustomerStatus[]) : undefined;

    const companyParam = searchParams.get('company');
    const company = companyParam ? companyParam.split(',') : undefined;

    const riskParam = searchParams.get('risk');
    const risk = riskParam ? (riskParam.split(',') as RiskLevel[]) : undefined;

    const lastContactFrom = searchParams.get('lastContactFrom') || undefined;
    const lastContactTo = searchParams.get('lastContactTo') || undefined;
    const email = searchParams.get('email') || undefined;
    const phone = searchParams.get('phone') || undefined;

    return {
      search,
      sortBy,
      sortOrder,
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: isNaN(pageSize) || pageSize < 1 ? 10 : pageSize,
      status,
      company,
      risk,
      lastContactFrom,
      lastContactTo,
      email,
      phone,
    };
  }, [searchParams]);

  // Update helper that sets URL params and resets page to 1 if specified
  const updateParams = useCallback(
    (newParams: Partial<CustomerListParams>, resetPage: boolean = true) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      // Merge newParams
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          current.delete(key);
        } else if (Array.isArray(value)) {
          current.set(key, value.join(','));
        } else {
          current.set(key, String(value));
        }
      });

      // Pagination reset rule (§7.6): Any committed filter/search/sort/pageSize change resets to page 1
      if (resetPage && (searchParams.has('page') || Object.keys(newParams).some(k => newParams[k as keyof CustomerListParams] !== undefined))) {
        current.set('page', '1');
      }

      const searchStr = current.toString();
      const currentStr = searchParams.toString();

      // Guard: Do not trigger router.replace if parameters haven't changed!
      if (searchStr === currentStr) {
        return;
      }

      const queryStr = searchStr ? `?${searchStr}` : '';
      router.replace(`${pathname}${queryStr}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateParams({ search: search.trim() || undefined });
    },
    [updateParams]
  );

  const setSorting = useCallback(
    (sortBy: CustomerSortState['sortBy'], sortOrder?: CustomerSortState['sortOrder']) => {
      // Toggle sortOrder if clicking the same sortBy column
      if (sortBy === params.sortBy && !sortOrder) {
        const nextOrder = params.sortOrder === 'asc' ? 'desc' : 'asc';
        updateParams({ sortBy, sortOrder: nextOrder });
      } else {
        updateParams({ sortBy, sortOrder: sortOrder || 'asc' });
      }
    },
    [params.sortBy, params.sortOrder, updateParams]
  );

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page }, false); // page change does not reset page
    },
    [updateParams]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateParams({ pageSize, page: 1 });
    },
    [updateParams]
  );

  const setFilters = useCallback(
    (filters: CustomerFilterState) => {
      updateParams({
        search: filters.search,
        status: filters.status,
        company: filters.company,
        risk: filters.risk,
        lastContactFrom: filters.lastContactFrom,
        lastContactTo: filters.lastContactTo,
        email: filters.email,
        phone: filters.phone,
      });
    },
    [updateParams]
  );

  const clearFilters = useCallback(() => {
    updateParams({
      search: undefined,
      status: undefined,
      company: undefined,
      risk: undefined,
      lastContactFrom: undefined,
      lastContactTo: undefined,
      email: undefined,
      phone: undefined,
    });
  }, [updateParams]);

  return {
    params,
    setSearch,
    setSorting,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
  };
}
