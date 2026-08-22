import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../use-debounced-value';

describe('useDebouncedValue Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('updates the debounced value only after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change input value
    rerender({ value: 'updated', delay: 300 });

    // Value should still be 'initial' before timeout
    expect(result.current).toBe('initial');

    // Advance timers by 200ms (less than 300ms)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    // Advance the remaining 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('cancels previous timers on rapid value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    // Rapidly change values
    rerender({ value: 'ab', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abc', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abcd', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Still 'a' because timer kept resetting
    expect(result.current).toBe('a');

    // Now advance past 300ms from the last update
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('abcd');
  });
});
