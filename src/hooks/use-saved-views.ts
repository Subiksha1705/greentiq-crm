import { useCallback, useMemo, useSyncExternalStore } from 'react';
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

const STORAGE_KEY = 'greentiq_saved_views_custom';

export function sanitizeFilters(filters: CustomerFilterState): CustomerFilterState {
  return {
    status: filters.status && filters.status.length > 0 ? filters.status : undefined,
    company: filters.company && filters.company.length > 0 ? filters.company : undefined,
    risk: filters.risk && filters.risk.length > 0 ? filters.risk : undefined,
    lastContactFrom: filters.lastContactFrom || undefined,
    lastContactTo: filters.lastContactTo || undefined,
    email: filters.email?.trim() || undefined,
    phone: filters.phone?.trim() || undefined,
  };
}

export function areFiltersEqual(a: CustomerFilterState, b: CustomerFilterState): boolean {
  const cleanA = sanitizeFilters(a);
  const cleanB = sanitizeFilters(b);

  const keys: (keyof CustomerFilterState)[] = [
    'status', 'company', 'risk', 'lastContactFrom', 'lastContactTo', 'email', 'phone'
  ];

  for (const key of keys) {
    const valA = cleanA[key];
    const valB = cleanB[key];

    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false;
      const sortedA = [...valA].sort();
      const sortedB = [...valB].sort();
      if (!sortedA.every((v, i) => v === sortedB[i])) return false;
    } else if (valA !== valB) {
      if (!(valA === undefined && valB === undefined)) {
        return false;
      }
    }
  }

  return true;
}

function loadInitialViews(): SavedView[] {
  if (typeof window === 'undefined') return [...PREDEFINED_VIEWS];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const customViews: SavedView[] = JSON.parse(stored);
      return [...PREDEFINED_VIEWS, ...customViews];
    }
  } catch {
    // Ignore JSON parse errors
  }
  return [...PREDEFINED_VIEWS];
}

function persistCustomViews(allViews: SavedView[]) {
  if (typeof window === 'undefined') return;
  try {
    const customViews = allViews.filter((v) => !v.isPredefined);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customViews));
  } catch {
    // Ignore localStorage errors
  }
}

// Module-level external store
let globalViews = typeof window !== 'undefined' ? loadInitialViews() : [...PREDEFINED_VIEWS];
let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return globalViews;
}

function getServerSnapshot() {
  return PREDEFINED_VIEWS;
}

function notifyListeners() {
  persistCustomViews(globalViews);
  listeners.forEach((l) => l());
}

export function useSavedViews() {
  const { params: currentFilters } = useCustomerFilters();
  const views = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Determine active view by checking exact payload match
  const selectedViewId = useMemo(() => {
    const match = views.find((v) => {
      const payload = typeof v.filters === 'function' ? v.filters() : v.filters;
      return areFiltersEqual(payload, currentFilters);
    });
    return match?.id || null;
  }, [views, currentFilters]);

  const saveCustomView = useCallback((name: string, filters: CustomerFilterState) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 40) {
      throw new Error('Name must be between 1 and 40 characters.');
    }
    if (globalViews.some((v) => v.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error('A view with this name already exists.');
    }

    const cleaned = sanitizeFilters(filters);

    const newView: SavedView = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      isPredefined: false,
      filters: cleaned,
    };

    globalViews = [...globalViews, newView];
    notifyListeners();
    return newView.id;
  }, []);

  const saveCurrentAsView = useCallback((name: string) => {
    return saveCustomView(name, currentFilters);
  }, [currentFilters, saveCustomView]);

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
    saveCustomView,
    saveCurrentAsView,
    deleteView,
    reorderViews,
  };
}
