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
          <label className="text-[12px] font-semibold text-[#374151]">
            Customer Name <span className="text-[#EF4444]">*</span>
          </label>
          <Input
            {...register('name')}
            placeholder="e.g. Sarah Jenkins"
            className="h-9 text-[14px] border-[#D1D5DB]"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-[12px] text-[#EF4444]">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#374151]">
            Company <span className="text-[#EF4444]">*</span>
          </label>
          <Input
            {...register('company')}
            placeholder="e.g. Acme Corp"
            className="h-9 text-[14px] border-[#D1D5DB]"
            disabled={isSubmitting}
          />
          {errors.company && (
            <p className="text-[12px] text-[#EF4444]">{errors.company.message}</p>
          )}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#374151]">
            Email Address <span className="text-[#EF4444]">*</span>
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="s.jenkins@acme.com"
            className="h-9 text-[14px] border-[#D1D5DB]"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-[12px] text-[#EF4444]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#374151]">
            Phone Number <span className="text-[#EF4444]">*</span>
          </label>
          <Input
            {...register('phone')}
            placeholder="+1 (555) 234-5678"
            className="h-9 text-[14px] border-[#D1D5DB]"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-[12px] text-[#EF4444]">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Status & Last Contact Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#374151]">
            Status <span className="text-[#EF4444]">*</span>
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
                <SelectTrigger className="h-9 text-[14px] border-[#D1D5DB]">
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
            <p className="text-[12px] text-[#EF4444]">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-[#374151]">
            Last Contact Date <span className="text-[#EF4444]">*</span>
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
                  className="h-9 text-[14px] border-[#D1D5DB]"
                />
              );
            }}
          />
          {errors.lastContactDate && (
            <p className="text-[12px] text-[#EF4444]">
              {errors.lastContactDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-[#374151]">
          Notes & Account Context (Optional)
        </label>
        <Textarea
          {...register('notes')}
          placeholder="Additional notes about customer requirements, communication preferences, or account context..."
          className="text-[13px] border-[#D1D5DB] min-h-[90px]"
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="text-[12px] text-[#EF4444]">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-[14px] font-medium border-[#D1D5DB]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-[14px] font-semibold px-5 shadow-xs"
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
