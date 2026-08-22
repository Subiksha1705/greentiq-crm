import { Metadata } from 'next';
import { CompanyWorkspace } from '@/components/companies/company-workspace';

export const metadata: Metadata = {
  title: 'Companies & Account Groups | GreenTiq CRM',
  description: 'Manage corporate client accounts, tier groups, and multi-stakeholder portfolios.',
};

export default function CompaniesPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-[1440px]">
      <CompanyWorkspace />
    </div>
  );
}
