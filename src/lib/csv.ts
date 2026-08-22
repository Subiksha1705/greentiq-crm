import { Customer } from '@/types/customer';
import { getFollowUpRisk } from './customer-rules';

/**
 * Escapes a cell value for CSV formatting.
 * Encloses values containing quotes, commas, or newlines in double quotes.
 */
function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Exports customers to a downloadable CSV file.
 * 
 * Column order strictly matches PRD §10:
 * 1. Name
 * 2. Email
 * 3. Phone
 * 4. Company
 * 5. Status
 * 6. Last Contact
 * 7. Follow-up Risk (derived at export time via getFollowUpRisk)
 */
export function exportCustomersToCsv(
  customers: Customer[],
  filename: string = `greentiq_customers_${new Date().toISOString().split('T')[0]}.csv`
): void {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Company',
    'Status',
    'Last Contact',
    'Follow-up Risk',
  ];

  const rows = customers.map((customer) => {
    const derivedRisk = getFollowUpRisk(customer.lastContactDate);
    const riskLabel = derivedRisk.toUpperCase();

    return [
      escapeCsvValue(customer.name),
      escapeCsvValue(customer.email),
      escapeCsvValue(customer.phone),
      escapeCsvValue(customer.company),
      escapeCsvValue(customer.status),
      escapeCsvValue(customer.lastContactDate),
      escapeCsvValue(riskLabel),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
