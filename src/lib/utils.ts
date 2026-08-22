import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a date to local midnight (00:00:00.000).
 * Used across follow-up risk, date filters, sorting, and Zod validations
 * to guarantee pure calendar-day comparisons ignoring time-of-day.
 */
export function toCalendarDate(dateInput: Date | string | number): Date {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Calculates calendar days difference between today and a target date.
 * Calendar-day diff = calendarDate(today) - calendarDate(targetDate)
 */
export function getCalendarDaysDifference(targetDate: Date | string | number, relativeTo: Date = new Date()): number {
  const target = toCalendarDate(targetDate);
  const base = toCalendarDate(relativeTo);
  const diffTime = base.getTime() - target.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats a date cleanly into "MMM d, yyyy" format with safety against null/invalid values.
 */
export function formatDateSafely(dateInput: Date | string | number | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

