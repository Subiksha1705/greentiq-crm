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
