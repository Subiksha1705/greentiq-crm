import { z } from 'zod';
import { toCalendarDate } from '../utils';

/**
 * Shared Zod schema for Customer Creation and Editing.
 * Includes calendar-date validation ensuring lastContactDate is not in the future.
 */
export const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required'),
  email: z.string().trim().min(1, 'Email address is required').email('Invalid email address format'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine((val) => /^[+\d\s()--.]+$/.test(val), 'Invalid phone number format'),
  company: z.string().trim().min(1, 'Company name is required'),
  status: z.enum(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  }),
  lastContactDate: z
    .string()
    .min(1, 'Last contact date is required')
    .refine((val) => {
      const selectedDate = toCalendarDate(val);
      const today = toCalendarDate(new Date());
      // Calendar-date comparison: selected date must not be greater than today
      return selectedDate <= today;
    }, 'Last contact date cannot be in the future'),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
