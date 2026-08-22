'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { CustomerFilterState } from '@/types/customer';
import { useCustomerFilters } from './use-customer-filters';

export interface SavedView {
  id: string;
  name: string;
  isPredefined: boolean;
  filters: CustomerFilterState | (() => CustomerFilterState);
}

const PREDEFINED_VIEWS: SavedView[] = [
  {
    id: 'all',
    name: 'All Customers',
    isPredefined: true,
    filters: {},
  },
  {
    id: 'active',
    name: 'Active Customers',
    isPredefined: true,
    filters: { status: ['active'] },
  },
  {
    id: 'recent-contacts',
    name: 'Recent Contacts',
    isPredefined: true,
    filters: () => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      return {
        lastContactFrom: lastWeek.toISOString().split('T')[0],
        lastContactTo: today.toISOString().split('T')[0],
      };
    },
  },
  {
    id: 'needs-attention',
    name: 'Needs Attention',
    isPredefined: true,
    filters: { status: ['active'], risk: ['high'] },
  },
  {
    id: 'inactive',
    name: 'Inactive Customers',
    isPredefined: true,
    filters: { status: ['inactive'] },
  },
];

// Module-level state so it persists across hooks if used in multiple places
let globalViews = [...PREDEFINED_VIEWS];
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useSavedViews() {
  const { params: currentFilters } = useCustomerFilters();
  const [views, setViews] = useState<SavedView[]>(globalViews);

  useEffect(() => {
    const listener = () => setViews([...globalViews]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // Determine active view by checking exact payload match
  const selectedViewId = useMemo(() => {
    const isExactMatch = (v: SavedView) => {
      const payload = typeof v.filters === 'function' ? v.filters() : v.filters;
      const relevantKeys: (keyof CustomerFilterState)[] = [
        'status', 'company', 'risk', 'lastContactFrom', 'lastContactTo', 'email', 'phone'
      ];
      
      for (const key of relevantKeys) {
        const payloadVal = payload[key];
        const currentVal = currentFilters[key];

        if (Array.isArray(payloadVal) && Array.isArray(currentVal)) {
          if (payloadVal.length !== currentVal.length) return false;
          const sortedP = [...payloadVal].sort();
          const sortedC = [...currentVal].sort();
          if (!sortedP.every((val, i) => val === sortedC[i])) return false;
        } else if (payloadVal !== currentVal) {
          // If both are undefined, it's fine. If one is undefined and other is not, it fails.
          if (!(payloadVal === undefined && currentVal === undefined)) {
            return false;
          }
        }
      }
      return true;
    };

    const match = views.find(isExactMatch);
    return match?.id || null;
  }, [views, currentFilters]);

  const saveCurrentAsView = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 40) {
      throw new Error('Name must be between 1 and 40 characters.');
    }
    if (views.some((v) => v.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error('A view with this name already exists.');
    }

    const newView: SavedView = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      isPredefined: false,
      filters: {
        status: currentFilters.status,
        company: currentFilters.company,
        risk: currentFilters.risk,
        lastContactFrom: currentFilters.lastContactFrom,
        lastContactTo: currentFilters.lastContactTo,
        email: currentFilters.email,
        phone: currentFilters.phone,
      },
    };

    globalViews = [...globalViews, newView];
    notifyListeners();
    return newView.id;
  }, [currentFilters, views]);

  const deleteView = useCallback((id: string) => {
    const view = globalViews.find((v) => v.id === id);
    if (!view || view.isPredefined) return;
    
    globalViews = globalViews.filter((v) => v.id !== id);
    notifyListeners();
  }, []);

  const reorderViews = useCallback((fromIndex: number, toIndex: number) => {
    const newViews = [...globalViews];
    const [moved] = newViews.splice(fromIndex, 1);
    newViews.splice(toIndex, 0, moved);
    globalViews = newViews;
    notifyListeners();
  }, []);

  return {
    views,
    selectedViewId,
    saveCurrentAsView,
    deleteView,
    reorderViews,
  };
}
