'use client';

import React, { useState } from 'react';
import { Company, CompanyIndustry, CompanyTier, CreateCompanyInput } from '@/types/company';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Globe, MapPin, Layers, RefreshCw } from 'lucide-react';

const INDUSTRIES: CompanyIndustry[] = [
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

const TIERS: CompanyTier[] = ['Enterprise', 'Mid-Market', 'SMB', 'Startup'];

interface CompanyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Company>;
  onSubmit: (values: CreateCompanyInput) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CompanyForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CompanyFormProps) {
  const [name, setName] = useState(defaultValues?.name || '');
  const [industry, setIndustry] = useState<CompanyIndustry>(
    defaultValues?.industry || 'Technology'
  );
  const [tier, setTier] = useState<CompanyTier>(defaultValues?.tier || 'Mid-Market');
  const [website, setWebsite] = useState(defaultValues?.website || '');
  const [location, setLocation] = useState(defaultValues?.location || '');
  const [description, setDescription] = useState(defaultValues?.description || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const nextErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      nextErrors.name = 'Company name is required.';
    } else if (name.trim().length > 60) {
      nextErrors.name = 'Company name must not exceed 60 characters.';
    }

    if (website.trim() && !/^https?:\/\/.+/i.test(website.trim()) && !/^www\..+/i.test(website.trim())) {
      nextErrors.website = 'Website must start with http://, https://, or www.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let formattedWebsite = website.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    await onSubmit({
      name: name.trim(),
      industry,
      tier,
      website: formattedWebsite || undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Name */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-[var(--primary)]" />
          <span>Company Name <span className="text-destructive">*</span></span>
        </label>
        <Input
          type="text"
          placeholder="e.g. Acme Corporation"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          className="h-9 text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px]"
          autoFocus
        />
        {errors.name && <p className="text-[12px] text-destructive font-medium">{errors.name}</p>}
      </div>

      {/* Industry and Tier Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Industry */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Industry Sector</span>
          </label>
          <Select value={industry} onValueChange={(val) => setIndustry(val as CompanyIndustry)}>
            <SelectTrigger className="h-9 text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px]">
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account Tier */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[var(--text-primary)]">
            Account Tier
          </label>
          <Select value={tier} onValueChange={(val) => setTier(val as CompanyTier)}>
            <SelectTrigger className="h-9 text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px]">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              {TIERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Website and Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Website */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Website</span>
          </label>
          <Input
            type="text"
            placeholder="https://acmecorp.com"
            value={website}
            onChange={(e) => {
              setWebsite(e.target.value);
              if (errors.website) setErrors((prev) => ({ ...prev, website: '' }));
            }}
            className="h-9 text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px]"
          />
          {errors.website && <p className="text-[12px] text-destructive font-medium">{errors.website}</p>}
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>Headquarters / Location</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px]"
          />
        </div>
      </div>

      {/* Description / Notes */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[var(--text-primary)]">
          Company Overview & Notes
        </label>
        <Textarea
          placeholder="Add key account context, company profile notes, and account strategy..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-[14px] bg-[var(--card)] border-[var(--border-default)] rounded-[6px] resize-none"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-default)]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-[13px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[13px] font-semibold gap-1.5"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : mode === 'create' ? (
            'Create Company'
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
