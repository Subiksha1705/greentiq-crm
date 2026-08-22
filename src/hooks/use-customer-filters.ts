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

export interface FilterChipItem {
  id: string;
  category: string;
  label: string;
  onRemove: () => void;
}

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

      // Guard: Do not trigger navigation if parameters haven't changed and already on /customers
      if (searchStr === currentStr && pathname === '/customers') {
        return;
      }

      const queryStr = searchStr ? `?${searchStr}` : '';
      if (pathname !== '/customers') {
        router.push(`/customers${queryStr}`);
      } else {
        router.replace(`/customers${queryStr}`, { scroll: false });
      }
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
      updateParams({ page }, false);
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

  // Compute active filter count (excluding global search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.status && params.status.length > 0) count += params.status.length;
    if (params.company && params.company.length > 0) count += params.company.length;
    if (params.risk && params.risk.length > 0) count += params.risk.length;
    if (params.lastContactFrom || params.lastContactTo) count += 1;
    if (params.email && params.email.trim()) count += 1;
    if (params.phone && params.phone.trim()) count += 1;
    return count;
  }, [params]);

  // Generate active filter chip objects for rendering
  const activeFilterChips = useMemo<FilterChipItem[]>(() => {
    const chips: FilterChipItem[] = [];

    // Status chips
    if (params.status) {
      params.status.forEach((st) => {
        chips.push({
          id: `status-${st}`,
          category: 'Status',
          label: st.charAt(0).toUpperCase() + st.slice(1),
          onRemove: () => {
            const nextStatus = params.status?.filter((s) => s !== st);
            updateParams({ status: nextStatus });
          },
        });
      });
    }

    // Risk chips
    if (params.risk) {
      params.risk.forEach((rk) => {
        chips.push({
          id: `risk-${rk}`,
          category: 'Risk',
          label: `${rk.charAt(0).toUpperCase() + rk.slice(1)} Risk`,
          onRemove: () => {
            const nextRisk = params.risk?.filter((r) => r !== rk);
            updateParams({ risk: nextRisk });
          },
        });
      });
    }

    // Company chips
    if (params.company) {
      params.company.forEach((cmp) => {
        chips.push({
          id: `company-${cmp}`,
          category: 'Company',
          label: cmp,
          onRemove: () => {
            const nextCompany = params.company?.filter((c) => c !== cmp);
            updateParams({ company: nextCompany });
          },
        });
      });
    }

    // Date range chip
    if (params.lastContactFrom || params.lastContactTo) {
      let dateLabel = '';
      if (params.lastContactFrom && params.lastContactTo) {
        dateLabel = `${params.lastContactFrom} to ${params.lastContactTo}`;
      } else if (params.lastContactFrom) {
        dateLabel = `From ${params.lastContactFrom}`;
      } else if (params.lastContactTo) {
        dateLabel = `Until ${params.lastContactTo}`;
      }

      chips.push({
        id: 'date-range',
        category: 'Last Contact',
        label: dateLabel,
        onRemove: () => {
          updateParams({ lastContactFrom: undefined, lastContactTo: undefined });
        },
      });
    }

    // Email filter chip
    if (params.email) {
      chips.push({
        id: 'email-filter',
        category: 'Email',
        label: params.email,
        onRemove: () => {
          updateParams({ email: undefined });
        },
      });
    }

    // Phone filter chip
    if (params.phone) {
      chips.push({
        id: 'phone-filter',
        category: 'Phone',
        label: params.phone,
        onRemove: () => {
          updateParams({ phone: undefined });
        },
      });
    }

    return chips;
  }, [params, updateParams]);

  return {
    params,
    setSearch,
    setSorting,
    setPage,
    setPageSize,
    setFilters,
    clearFilters,
    activeFilterCount,
    activeFilterChips,
  };
}
