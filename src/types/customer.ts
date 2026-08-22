export type CustomerStatus = 'active' | 'inactive';

export type RiskLevel = 'low' | 'medium' | 'high';

export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

export interface Interaction {
  id: string;
  type: InteractionType;
  summary: string;
  date: string; // ISO date string
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
  interactions?: Interaction[];
  createdAt: string;
  updatedAt: string;
  // NOTE: RiskLevel is ALWAYS derived dynamically via getFollowUpRisk(customer.lastContactDate).
  // It is NEVER stored directly on the Customer object.
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  needsAttention: number;
}

export interface CustomerFilterState {
  search?: string;
  status?: CustomerStatus[];
  company?: string[];
  risk?: RiskLevel[];
  lastContactFrom?: string; // YYYY-MM-DD
  lastContactTo?: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
}

export interface CustomerSortState {
  sortBy?: 'name' | 'email' | 'lastContactDate' | 'followUpRisk';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerListParams extends CustomerFilterState, CustomerSortState {
  page?: number;
  pageSize?: number;
}

export interface PaginatedCustomerResult {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}
