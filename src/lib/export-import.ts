import * as XLSX from 'xlsx';
import { Customer, CreateCustomerInput } from '@/types/customer';
import { getFollowUpRisk } from './customer-rules';

/**
 * Columns configuration for Excel and CSV export/import.
 */
export const CUSTOMER_FILE_HEADERS = [
  'Name',
  'Email',
  'Phone',
  'Company',
  'Status',
  'Last Contact',
  'Follow-up Risk',
];

/**
 * Exports customers to either Excel (.xlsx) or CSV (.csv).
 */
export function exportCustomers(
  customers: Customer[],
  format: 'xlsx' | 'csv',
  filenamePrefix: string = 'greentiq_customers'
): void {
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStamp}.${format}`;

  // Map customer objects to rows
  const data = customers.map((c) => ({
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    Company: c.company,
    Status: c.status,
    'Last Contact': c.lastContactDate,
    'Follow-up Risk': getFollowUpRisk(c.lastContactDate).toUpperCase(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: CUSTOMER_FILE_HEADERS });

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 22 }, // Name
    { wch: 28 }, // Email
    { wch: 18 }, // Phone
    { wch: 22 }, // Company
    { wch: 12 }, // Status
    { wch: 15 }, // Last Contact
    { wch: 16 }, // Follow-up Risk
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  XLSX.writeFile(workbook, filename, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });
}

/**
 * Generates a downloadable sample template for bulk imports.
 */
export function downloadSampleTemplate(format: 'xlsx' | 'csv'): void {
  const sampleData = [
    {
      Name: 'Sarah Connor',
      Email: 'sarah.connor@cyberdyne.io',
      Phone: '+1 (555) 349-2041',
      Company: 'Cyberdyne Systems',
      Status: 'active',
      'Last Contact': new Date().toISOString().split('T')[0],
      'Follow-up Risk': 'LOW',
    },
    {
      Name: 'Arthur Dent',
      Email: 'arthur.dent@galaxyguide.org',
      Phone: '+44 7911 123456',
      Company: 'Milliways Corp',
      Status: 'active',
      'Last Contact': new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'Follow-up Risk': 'MEDIUM',
    },
    {
      Name: 'Elena Rostova',
      Email: 'elena@solarisventures.com',
      Phone: '+1 (555) 890-1234',
      Company: 'Solaris Capital',
      Status: 'inactive',
      'Last Contact': new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'Follow-up Risk': 'HIGH',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: CUSTOMER_FILE_HEADERS });
  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 15 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

  XLSX.writeFile(workbook, `greentiq_customer_template.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });
}

export interface ParsedImportResult {
  validCustomers: CreateCustomerInput[];
  invalidRows: { row: number; reason: string; raw: Record<string, unknown> }[];
  totalRows: number;
}

/**
 * Parses and validates an uploaded Excel or CSV file.
 */
export async function parseCustomerFile(file: File): Promise<ParsedImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded file does not contain any sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const validCustomers: CreateCustomerInput[] = [];
  const invalidRows: { row: number; reason: string; raw: Record<string, unknown> }[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // +1 for 1-based, +1 for header row

    // Find keys flexibly case-insensitively
    const findValue = (keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.some((target) => target.toLowerCase() === k.trim().toLowerCase())) {
          return String(row[k]).trim();
        }
      }
      return '';
    };

    const name = findValue(['Name', 'Customer Name', 'Full Name']);
    const email = findValue(['Email', 'Email Address']);
    const phone = findValue(['Phone', 'Phone Number', 'Telephone']);
    const company = findValue(['Company', 'Company Name', 'Organization']);
    const statusRaw = findValue(['Status', 'Account Status']).toLowerCase();
    let lastContactDate = findValue(['Last Contact', 'Last Contact Date', 'LastContactDate']);
    const notes = findValue(['Notes', 'Note', 'Comments']);

    // Validations
    if (!name) {
      invalidRows.push({ row: rowNumber, reason: 'Missing Name', raw: row });
      return;
    }

    if (!email || !email.includes('@')) {
      invalidRows.push({ row: rowNumber, reason: 'Invalid or missing Email', raw: row });
      return;
    }

    if (!phone) {
      invalidRows.push({ row: rowNumber, reason: 'Missing Phone number', raw: row });
      return;
    }

    if (!company) {
      invalidRows.push({ row: rowNumber, reason: 'Missing Company', raw: row });
      return;
    }

    const status = statusRaw === 'inactive' ? 'inactive' : 'active';

    // Format date if needed
    if (!lastContactDate) {
      lastContactDate = todayStr;
    } else {
      // Validate date string
      const parsed = new Date(lastContactDate);
      if (isNaN(parsed.getTime())) {
        lastContactDate = todayStr;
      } else {
        lastContactDate = parsed.toISOString().split('T')[0];
      }
    }

    validCustomers.push({
      name,
      email,
      phone,
      company,
      status,
      lastContactDate,
      notes: notes || undefined,
    });
  });

  return {
    validCustomers,
    invalidRows,
    totalRows: rawRows.length,
  };
}

/**
 * Columns configuration for Company Excel and CSV export/import.
 */
export const COMPANY_FILE_HEADERS = [
  'Company Name',
  'Industry',
  'Account Tier',
  'Website',
  'Location',
  'Description',
  'Total Contacts',
  'Active Contacts',
];

/**
 * Exports companies to either Excel (.xlsx) or CSV (.csv).
 */
export function exportCompanies(
  companies: import('@/types/company').CompanyWithStats[],
  format: 'xlsx' | 'csv',
  filenamePrefix: string = 'greentiq_companies'
): void {
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStamp}.${format}`;

  const data = companies.map((c) => ({
    'Company Name': c.name,
    Industry: c.industry,
    'Account Tier': c.tier,
    Website: c.website || '',
    Location: c.location || '',
    Description: c.description || '',
    'Total Contacts': c.totalContacts,
    'Active Contacts': c.activeContacts,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, { header: COMPANY_FILE_HEADERS });

  worksheet['!cols'] = [
    { wch: 25 }, // Company Name
    { wch: 20 }, // Industry
    { wch: 15 }, // Account Tier
    { wch: 28 }, // Website
    { wch: 22 }, // Location
    { wch: 35 }, // Description
    { wch: 15 }, // Total Contacts
    { wch: 15 }, // Active Contacts
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

  XLSX.writeFile(workbook, filename, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });
}

/**
 * Generates a downloadable sample template for bulk company imports.
 */
export function downloadCompanySampleTemplate(format: 'xlsx' | 'csv'): void {
  const sampleData = [
    {
      'Company Name': 'Stripe Payments',
      Industry: 'Financial Services',
      'Account Tier': 'Enterprise',
      Website: 'https://stripe.com',
      Location: 'San Francisco, CA',
      Description: 'Global payments and financial infrastructure platform.',
      'Total Contacts': 0,
      'Active Contacts': 0,
    },
    {
      'Company Name': 'Vercel Inc',
      Industry: 'Technology',
      'Account Tier': 'Enterprise',
      Website: 'https://vercel.com',
      Location: 'San Francisco, CA',
      Description: 'Cloud platform for frontend developers and Next.js applications.',
      'Total Contacts': 0,
      'Active Contacts': 0,
    },
    {
      'Company Name': 'BioTech Innovations',
      Industry: 'Healthcare',
      'Account Tier': 'Startup',
      Website: 'https://biotechinnovate.io',
      Location: 'Boston, MA',
      Description: 'Clinical research and genetic diagnostic devices.',
      'Total Contacts': 0,
      'Active Contacts': 0,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: COMPANY_FILE_HEADERS });
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 28 },
    { wch: 22 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

  XLSX.writeFile(workbook, `greentiq_companies_template.${format}`, {
    bookType: format === 'xlsx' ? 'xlsx' : 'csv',
  });
}

export interface ParsedCompanyImportResult {
  validCompanies: import('@/types/company').CreateCompanyInput[];
  invalidRows: { row: number; reason: string; raw: Record<string, unknown> }[];
  totalRows: number;
}

/**
 * Parses and validates an uploaded Company Excel or CSV file.
 */
export async function parseCompanyFile(file: File): Promise<ParsedCompanyImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded file does not contain any sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const validCompanies: import('@/types/company').CreateCompanyInput[] = [];
  const invalidRows: { row: number; reason: string; raw: Record<string, unknown> }[] = [];

  const VALID_INDUSTRIES: import('@/types/company').CompanyIndustry[] = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Energy & CleanTech',
    'Retail',
    'Manufacturing',
    'Media',
    'Real Estate',
    'Other',
  ];

  const VALID_TIERS: import('@/types/company').CompanyTier[] = [
    'Enterprise',
    'Mid-Market',
    'SMB',
    'Startup',
  ];

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;

    const findValue = (keys: string[]) => {
      for (const k of Object.keys(row)) {
        if (keys.some((target) => target.toLowerCase() === k.trim().toLowerCase())) {
          return String(row[k]).trim();
        }
      }
      return '';
    };

    const name = findValue(['Company Name', 'Name', 'Organization', 'Company']);
    const industryRaw = findValue(['Industry', 'Sector', 'Industry Sector']);
    const tierRaw = findValue(['Account Tier', 'Tier']);
    const website = findValue(['Website', 'URL', 'Web']);
    const location = findValue(['Location', 'Headquarters', 'City', 'HQ']);
    const description = findValue(['Description', 'Overview', 'Notes', 'About']);

    if (!name) {
      invalidRows.push({ row: rowNumber, reason: 'Missing Company Name', raw: row });
      return;
    }

    const matchedIndustry = VALID_INDUSTRIES.find(
      (ind) => ind.toLowerCase() === industryRaw.toLowerCase()
    ) || 'Technology';

    const matchedTier = VALID_TIERS.find(
      (t) => t.toLowerCase() === tierRaw.toLowerCase()
    ) || 'Mid-Market';

    validCompanies.push({
      name,
      industry: matchedIndustry,
      tier: matchedTier,
      website: website || undefined,
      location: location || undefined,
      description: description || undefined,
    });
  });

  return {
    validCompanies,
    invalidRows,
    totalRows: rawRows.length,
  };
}
