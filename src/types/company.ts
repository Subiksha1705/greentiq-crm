import { Customer } from './customer';

export type CompanyTier = 'Enterprise' | 'Mid-Market' | 'SMB' | 'Startup';

export type CompanyIndustry =
  | 'Technology'
  | 'Healthcare'
  | 'Financial Services'
  | 'Energy & CleanTech'
  | 'Retail'
  | 'Manufacturing'
  | 'Media'
  | 'Real Estate'
  | 'Other';

export interface Company {
  id: string;
  name: string;
  industry: CompanyIndustry;
  tier: CompanyTier;
  website?: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithStats extends Company {
  totalContacts: number;
  activeContacts: number;
  highRiskContacts: number;
  contacts?: Customer[];
}

export interface CreateCompanyInput {
  name: string;
  industry: CompanyIndustry;
  tier: CompanyTier;
  website?: string;
  location?: string;
  description?: string;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export interface CompanyFilterState {
  search?: string;
  industry?: CompanyIndustry[];
  tier?: CompanyTier[];
}

export interface CompanySortState {
  sortBy?: 'name' | 'industry' | 'tier' | 'totalContacts' | 'activeContacts';
  sortOrder?: 'asc' | 'desc';
}

export interface CompanyListParams extends CompanyFilterState, CompanySortState {
  page?: number;
  pageSize?: number;
}

export interface PaginatedCompanyResult {
  data: CompanyWithStats[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
