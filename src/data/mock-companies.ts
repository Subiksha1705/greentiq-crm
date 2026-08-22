import { Company, CompanyIndustry, CompanyTier } from '@/types/company';

interface SeedCompanyMeta {
  name: string;
  industry: CompanyIndustry;
  tier: CompanyTier;
  location: string;
  domain: string;
  description: string;
}

const SEED_COMPANIES: SeedCompanyMeta[] = [
  {
    name: 'Acme Corp',
    industry: 'Manufacturing',
    tier: 'Enterprise',
    location: 'San Francisco, CA',
    domain: 'acmecorp.com',
    description: 'Leading international manufacturer of high-precision hardware and industrial components.',
  },
  {
    name: 'Apex Global',
    industry: 'Financial Services',
    tier: 'Enterprise',
    location: 'New York, NY',
    domain: 'apexglobal.com',
    description: 'Global asset management and capital advisory firm for institutional clients.',
  },
  {
    name: 'BioTech Labs',
    industry: 'Healthcare',
    tier: 'Mid-Market',
    location: 'Boston, MA',
    domain: 'biotechlabs.org',
    description: 'Pioneering clinical diagnostics and genomics research facility.',
  },
  {
    name: 'CloudScale Inc',
    industry: 'Technology',
    tier: 'Enterprise',
    location: 'Seattle, WA',
    domain: 'cloudscale.io',
    description: 'Hyperscale cloud orchestration and multi-region Kubernetes platform.',
  },
  {
    name: 'CyberShield',
    industry: 'Technology',
    tier: 'Mid-Market',
    location: 'Austin, TX',
    domain: 'cybershield.sec',
    description: 'Next-generation threat intelligence and SOC automation suite.',
  },
  {
    name: 'DataFlow Analytics',
    industry: 'Technology',
    tier: 'Startup',
    location: 'Boulder, CO',
    domain: 'dataflowanalytics.dev',
    description: 'Real-time streaming data analytics engine for high-frequency telematics.',
  },
  {
    name: 'EcoSphere Solutions',
    industry: 'Energy & CleanTech',
    tier: 'Enterprise',
    location: 'Portland, OR',
    domain: 'ecospheresolutions.eco',
    description: 'Renewable power infrastructure and carbon offset compliance platform.',
  },
  {
    name: 'Elevate AI',
    industry: 'Technology',
    tier: 'Startup',
    location: 'San Jose, CA',
    domain: 'elevateai.ai',
    description: 'Generative AI workflows and agentic workflow orchestration for enterprise teams.',
  },
  {
    name: 'Frontier Energy',
    industry: 'Energy & CleanTech',
    tier: 'Enterprise',
    location: 'Houston, TX',
    domain: 'frontierenergy.com',
    description: 'Next-generation geothermal and advanced hydrogen energy systems.',
  },
  {
    name: 'GreenTiq Technologies',
    industry: 'Technology',
    tier: 'Enterprise',
    location: 'San Francisco, CA',
    domain: 'greentiq.com',
    description: 'Flagship enterprise CRM and customer relationship intelligence provider.',
  },
  {
    name: 'Horizon Media',
    industry: 'Media',
    tier: 'Mid-Market',
    location: 'Los Angeles, CA',
    domain: 'horizonmedia.co',
    description: 'Digital storytelling, streaming analytics, and brand engagement network.',
  },
  {
    name: 'Hyperion Systems',
    industry: 'Technology',
    tier: 'Mid-Market',
    location: 'Atlanta, GA',
    domain: 'hyperionsystems.tech',
    description: 'Enterprise ERP modernization and distributed legacy systems integration.',
  },
  {
    name: 'InnovateX',
    industry: 'Technology',
    tier: 'Startup',
    location: 'Salt Lake City, UT',
    domain: 'innovatex.io',
    description: 'Agile product incubation and AI-assisted prototype accelerator.',
  },
  {
    name: 'Kinetix Health',
    industry: 'Healthcare',
    tier: 'Enterprise',
    location: 'Philadelphia, PA',
    domain: 'kinetixhealth.med',
    description: 'Integrated digital health networks and remote patient monitoring solutions.',
  },
  {
    name: 'Logix Supply Chain',
    industry: 'Manufacturing',
    tier: 'Enterprise',
    location: 'Chicago, IL',
    domain: 'logixsupply.com',
    description: 'End-to-end multimodal logistics optimization and warehouse automation.',
  },
  {
    name: 'Matrix Financial',
    industry: 'Financial Services',
    tier: 'Enterprise',
    location: 'Charlotte, NC',
    domain: 'matrixfinancial.com',
    description: 'Commercial lending, algorithmic treasury management, and fintech infrastructure.',
  },
  {
    name: 'Nexus Software',
    industry: 'Technology',
    tier: 'Mid-Market',
    location: 'Raleigh, NC',
    domain: 'nexussoftware.io',
    description: 'Developer platforms, API gateways, and CI/CD security tooling.',
  },
  {
    name: 'OmniRetail',
    industry: 'Retail',
    tier: 'Enterprise',
    location: 'Minneapolis, MN',
    domain: 'omniretail.com',
    description: 'Omnichannel commerce, dynamic pricing, and personalized in-store tech.',
  },
  {
    name: 'Pulse Dynamics',
    industry: 'Healthcare',
    tier: 'SMB',
    location: 'San Diego, CA',
    domain: 'pulsedynamics.bio',
    description: 'Cardiovascular diagnostics and wearable telemetry sensors.',
  },
  {
    name: 'Quantum Robotics',
    industry: 'Manufacturing',
    tier: 'Mid-Market',
    location: 'Detroit, MI',
    domain: 'quantumrobotics.net',
    description: 'Collaborative assembly robots and autonomous guided vehicles (AGVs).',
  },
  {
    name: 'Starlight Ventures',
    industry: 'Financial Services',
    tier: 'SMB',
    location: 'Miami, FL',
    domain: 'starlightventures.vc',
    description: 'Early-stage venture capital backing deep-tech and sustainable founders.',
  },
  {
    name: 'TerraForm Real Estate',
    industry: 'Real Estate',
    tier: 'Mid-Market',
    location: 'Denver, CO',
    domain: 'terraformre.com',
    description: 'Sustainable commercial real estate development and smart building operator.',
  },
  {
    name: 'Vanguard Industrial',
    industry: 'Manufacturing',
    tier: 'Enterprise',
    location: 'Cleveland, OH',
    domain: 'vanguardindustrial.com',
    description: 'Heavy machinery, turbine fabrication, and automated metal stamping.',
  },
  {
    name: 'Zenith Capital',
    industry: 'Financial Services',
    tier: 'Enterprise',
    location: 'New York, NY',
    domain: 'zenithcapital.com',
    description: 'Private equity and mezzanine debt financing for high-growth enterprises.',
  },
];

function generateSeedCompanies(): Company[] {
  return SEED_COMPANIES.map((seed, index) => ({
    id: `comp-${index + 1}`,
    name: seed.name,
    industry: seed.industry,
    tier: seed.tier,
    location: seed.location,
    website: `https://${seed.domain}`,
    description: seed.description,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));
}

export let MOCK_COMPANIES_STORE: Company[] = generateSeedCompanies();

export function resetMockCompaniesStore(): void {
  MOCK_COMPANIES_STORE = generateSeedCompanies();
}
