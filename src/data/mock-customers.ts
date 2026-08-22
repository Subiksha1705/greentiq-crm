import { Customer } from '@/types/customer';

const COMPANIES = [
  'Acme Corp', 'Apex Global', 'BioTech Labs', 'CloudScale Inc', 'CyberShield',
  'DataFlow Analytics', 'EcoSphere Solutions', 'Elevate AI', 'Frontier Energy',
  'GreenTiq Technologies', 'Horizon Media', 'Hyperion Systems', 'InnovateX',
  'Kinetix Health', 'Logix Supply Chain', 'Matrix Financial', 'Nexus Software',
  'OmniRetail', 'Pulse Dynamics', 'Quantum Robotics', 'Starlight Ventures',
  'TerraForm Real Estate', 'Vanguard Industrial', 'Zenith Capital'
];

const FIRST_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah',
  'Ian', 'Julia', 'Kevin', 'Laura', 'Marcus', 'Nora', 'Oliver', 'Paula',
  'Quentin', 'Rachel', 'Samuel', 'Tina', 'Ulysses', 'Victoria', 'William', 'Xena'
];

const LAST_NAMES = [
  'Anderson', 'Baker', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris',
  'Jackson', 'King', 'Lopez', 'Miller', 'Nelson', 'Owen', 'Patel', 'Quinn',
  'Roberts', 'Smith', 'Taylor', 'Underwood', 'Vance', 'Wright', 'Young', 'Zimmerman'
];

/**
 * Helper to generate a date offset in days from today.
 */
function getPastDateISO(daysAgo: number): string {
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
  return target.toISOString().split('T')[0];
}

/**
 * Seed 200 mock customers deterministically with representative risk distribution:
 * - 0 to 7 days ago: ~70 customers (Low Risk)
 * - 8 to 30 days ago: ~80 customers (Medium Risk)
 * - 31 to 90 days ago: ~50 customers (High Risk)
 */
function generateSeedCustomers(): Customer[] {
  const customers: Customer[] = [];
  
  // Specific day offsets to guarantee clean distribution across Low, Medium, and High risk buckets
  const dayOffsets = [
    // Low risk (0-7 days)
    0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7,
    0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 4, 5, 6, 7,
    // Medium risk (8-30 days)
    8, 9, 10, 12, 14, 15, 18, 20, 22, 25, 28, 30, 8, 11, 13, 16, 19, 21, 24, 27, 29, 30, 9, 14, 17, 22, 26, 30,
    8, 10, 12, 15, 18, 20, 23, 25, 28, 30, 9, 11, 14, 16, 19, 21, 24, 27, 29, 8, 12, 15, 17, 20, 23, 26, 28, 30,
    9, 13, 16, 18, 22, 25, 27, 30, 8, 11, 15, 19, 21, 24, 28, 30, 10, 14, 17, 20, 23, 26, 29, 30,
    // High risk (31-90 days)
    31, 35, 40, 45, 50, 60, 75, 90, 32, 38, 42, 48, 55, 65, 80, 31, 36, 44, 52, 62, 70, 85, 33, 39, 46, 58, 68, 78, 88,
    31, 34, 41, 49, 57, 64, 72, 82, 32, 37, 43, 51, 61, 71, 81, 31, 35, 45, 55, 65, 75, 85
  ];

  for (let i = 0; i < 200; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const company = COMPANIES[(i * 3) % COMPANIES.length];
    const daysAgo = dayOffsets[i % dayOffsets.length];
    
    // Status distribution: ~80% active, ~20% inactive
    const status = i % 5 === 0 ? 'inactive' : 'active';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    const phone = `+1 (${555 + (i % 10)}) ${100 + (i % 900)}-${1000 + (i * 13) % 9000}`;
    const lastContactDate = getPastDateISO(daysAgo);

    customers.push({
      id: `cust-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      company,
      status,
      lastContactDate,
      notes: `Key stakeholder at ${company}. Expressed interest in scaling GreenTiq enterprise solution.`,
      interactions: [
        {
          id: `int-${i}-1`,
          type: 'call',
          summary: 'Quarterly review call regarding subscription renewal and usage metrics.',
          date: lastContactDate,
        },
        {
          id: `int-${i}-2`,
          type: 'email',
          summary: 'Sent detailed pricing proposal and ROI report.',
          date: getPastDateISO(daysAgo + 14),
        },
      ],
      createdAt: getPastDateISO(daysAgo + 120),
      updatedAt: lastContactDate,
    });
  }

  return customers;
}

// In-memory module-level session store
export const MOCK_CUSTOMERS_STORE: Customer[] = generateSeedCustomers();
