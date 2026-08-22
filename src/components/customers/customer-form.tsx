'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFormSchema, CustomerFormValues } from '@/lib/validations/customer';
import { Customer } from '@/types/customer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { PhoneInput } from '@/components/ui/phone-input';
import { useCompanyOptions } from '@/hooks/use-company-options';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { RefreshCw } from 'lucide-react';

interface CustomerFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Customer>;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CustomerFormProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: companyOptions = [] } = useCompanyOptions();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      company: defaultValues?.company || '',
      status: defaultValues?.status || 'active',
      lastContactDate: defaultValues?.lastContactDate || todayStr,
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Customer Name <span className="text-[var(--destructive)]">*</span>
          </label>
          <Input
            {...register('name')}
            placeholder="e.g. Sarah Jenkins"
            className="h-9 text-[14px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)]"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-[12px] text-[var(--destructive)]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center justify-between">
            <span>Company <span className="text-[var(--destructive)]">*</span></span>
          </label>
          <div className="space-y-1.5">
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Select
                    value={field.value || ''}
                    onValueChange={(val) => {
                      if (val === '__custom__') {
                        field.onChange('');
                      } else {
                        field.onChange(val);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9 text-[14px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)]">
                      <SelectValue placeholder="Select or enter company" />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {companyOptions.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span>{c.name}</span>
                            <span className="text-[11px] text-[var(--text-tertiary)] font-normal">
                              {c.tier}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Fallback free-text input if user wants a custom or unlisted company */}
                  <Input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Or type custom company name..."
                    className="h-8 text-[13px] border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-primary)]"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            />
          </div>
          {errors.company && (
            <p className="text-[12px] text-[var(--destructive)]">{errors.company.message}</p>
          )}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Email Address <span className="text-[var(--destructive)]">*</span>
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="s.jenkins@acme.com"
            className="h-9 text-[14px] border-[var(--border-default)] bg-[var(--card)] text-[var(--text-primary)]"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-[12px] text-[var(--destructive)]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Phone Number <span className="text-[var(--destructive)]">*</span>
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.phone && (
            <p className="text-[12px] text-[var(--destructive)]">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Status & Last Contact Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Status <span className="text-[var(--destructive)]">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-9 text-[14px] border-[var(--border-default)]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-[12px] text-[var(--destructive)]">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
            Last Contact Date <span className="text-[var(--destructive)]">*</span>
          </label>
          <Controller
            name="lastContactDate"
            control={control}
            render={({ field }) => {
              const currentDate = field.value ? parseISO(field.value) : new Date();
              return (
                <DatePicker
                  date={currentDate}
                  onSelect={(d) => {
                    if (d) {
                      field.onChange(format(d, 'yyyy-MM-dd'));
                    }
                  }}
                  toDate={new Date()}
                  disabled={(d) => d > new Date()}
                  className="h-9 text-[14px] border-[var(--border-default)]"
                />
              );
            }}
          />
          {errors.lastContactDate && (
            <p className="text-[12px] text-[var(--destructive)]">
              {errors.lastContactDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
          Notes & Account Context (Optional)
        </label>
        <Textarea
          {...register('notes')}
          placeholder="Additional notes about customer requirements, communication preferences, or account context..."
          className="text-[13px] border-[var(--border-default)] min-h-[90px]"
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-[12px] text-[var(--destructive)]">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-[14px] font-medium border-[var(--border-default)]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-semibold px-5 shadow-xs"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </span>
          ) : mode === 'create' ? (
            'Create Customer'
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
