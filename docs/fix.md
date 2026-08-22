# Greentiq CRM — Remediation PRD (Code Review Fixes)

**Project:** Greentiq Advanced CRM Dashboard
**Repo:** https://github.com/Subiksha1705/greentiq-crm
**Live:** https://greentiq-crm-nine.vercel.app/
**Source:** Reviewer feedback (issues #10–#15), consolidated for implementation
**Status:** Not started
**Purpose:** This document turns a set of code-review comments into an actionable fix spec. It does **not** redesign the app — it patches three real defects and two code-quality issues that were flagged before submission.

---

## 0. How to use this document

1. Fix issues in **priority order** (Section 1).
2. Each issue below has: Problem → Root cause → Current code → Required fix → Acceptance criteria → Files touched.
3. After each fix, re-verify manually against the Acceptance Criteria — don't just make the type-checker/linter pass.
4. Do not expand scope beyond what's described (e.g., don't redesign Saved Views while fixing the `catch` block).

---

## 1. Priority Summary

| # | Issue | Severity | Type |
|---|-------|----------|------|
| 10 | Company filter options only reflect the current page, not the full dataset | **HIGH** | Functional bug |
| 11 | Cross-page export loses previously-selected customers | **HIGH** | Functional bug |
| 12 | "Export filtered customers" only exports the current page, not the full filtered set | **MEDIUM-HIGH** | Functional bug |
| 14 | `phone-input.tsx` — `useEffect` re-derives state from props, causing an unnecessary extra render | LOW-MEDIUM | Code quality / React Compiler warning |
| 15 | `catch (err: any)` in `saved-views.tsx` | LOW | Lint / type-safety |

Fix order: **10 → 11 → 12 → 14 → 15**. The three functional bugs (10–12) share a root cause — UI code reading `data.data` (the current page) where it should be reading the full/filtered dataset — so they should be fixed together via one shared data-layer change, then verified independently.

---

## 2. Shared Root Cause (Issues #10, #11, #12)

All three bugs come from the same architectural gap: `useCustomers(params)` (via `listCustomers`) returns **paginated** data (`data.data` = current page only). Three different pieces of UI incorrectly treat `data.data` as if it were the complete dataset:

- Company filter dropdown → should be all distinct companies across all 200 customers
- Export → "Selected" scope → should resolve selected IDs against the full dataset, not just the visible page
- Export → "Filtered" scope → should be the entire filtered result set (pre-pagination), not just the page currently rendered

`src/lib/api/customers.ts` already filters before paginating internally:

```ts
// 1. Filter full dataset
let filtered = MOCK_CUSTOMERS_STORE.filter((customer) => matchesAllFilters(customer, params));
// 2. Sort dataset
...
// 3. Paginate
const paginatedData = filtered.slice(startIndex, startIndex + pageSize);
```

The fix is to **expose that pre-pagination result** (or a derived subset of it) to the UI, instead of adding new duplicate filtering logic in the components.

---

## 3. Issue #10 — Company filter options are wrong (HIGH)

### Problem
The Company filter dropdown is built from whatever customers happen to be on the current page, not the full customer list.

### Current code
`src/components/customers/customer-workspace.tsx`
```ts
const companyOptions = useMemo(() => {
  if (!data?.data) return [];
  const set = new Set<string>();

  data.data.forEach((c) => {
    if (c.company) set.add(c.company);
  });

  return Array.from(set).sort();
}, [data?.data]);
```

With 200 seeded customers across multiple pages, this only ever surfaces the companies present on the page currently being viewed. A user on page 1 cannot filter by a company that only appears on page 2.

### Required fix
Do **not** increase page size to 200 as a workaround. Instead, add a dedicated data-layer accessor for the full set of distinct company values, independent of pagination/filtering-by-company:

`src/lib/api/customers.ts`
```ts
export async function getCustomerFilterOptions(): Promise<{ companies: string[] }> {
  await simulateLatency();
  const companies = Array.from(
    new Set(MOCK_CUSTOMERS_STORE.map((c) => c.company).filter(Boolean))
  ).sort();
  return { companies };
}
```

Add a corresponding hook (e.g. `src/hooks/use-customer-filter-options.ts`) using TanStack Query with a stable query key (e.g. `customerKeys.filterOptions()`), since this list rarely changes and should not be recomputed from `data.data`.

Replace the `companyOptions` `useMemo` in `customer-workspace.tsx` with the result of this new hook, and pass that down to `CustomerFilters` in place of the current derivation.

### Acceptance criteria
- [ ] Opening the Company filter shows every distinct company across **all 200** seeded customers, regardless of which page or filter is currently active.
- [ ] Changing pages does **not** change the set of companies available in the filter.
- [ ] `companyOptions` is no longer derived from `data.data`.

### Files touched
- `src/lib/api/customers.ts`
- `src/hooks/` (new hook)
- `src/components/customers/customer-workspace.tsx`

---

## 4. Issue #11 — Cross-page export loses selected customers (HIGH)

### Problem
`selectedCustomerIds` is correctly maintained independent of pagination (selections made on page 1 survive navigating to page 2). However, when building the export payload, selected customers are resolved by filtering `data.data` — the current page only — so IDs selected on other pages disappear from the export.

### Current code
`src/components/customers/customer-workspace.tsx`
```ts
selectedCustomers={(data?.data || []).filter((c) => selectedCustomerIds.includes(c.id))}
```

Example of the bug: select customer A and B on page 1, navigate to page 2, select C, open Export → the export only contains C, because A and B are no longer in `data.data`.

### Required fix
Resolve `selectedCustomerIds` against the complete customer collection, not the current page. Two viable approaches — pick the one that best fits the existing data layer:

**Option A (preferred): fetch by ID.**
Add `getCustomersByIds(ids: string[])` to `src/lib/api/customers.ts` that looks up directly against `MOCK_CUSTOMERS_STORE`, and use it (via a hook, only enabled when the Export modal is open and there are selected IDs) to resolve the full `Customer[]` for export.

**Option B: maintain a client-side selection cache.**
When a customer is selected, also cache the full `Customer` object (not just the ID) in a `Map<string, Customer>` alongside `selectedCustomerIds`. Use that map to build `selectedCustomers` for export instead of re-deriving from `data.data`.

Option A is preferred because it keeps a single source of truth (the mock store) and avoids state drift if a selected customer is edited/deleted elsewhere in the app.

### Acceptance criteria
- [ ] Select customers across two or more different pages.
- [ ] Open Export → "Selected" scope shows the correct total count (sum of all selections, not just current page).
- [ ] The exported CSV contains every selected customer's row, including ones not on the currently visible page.

### Files touched
- `src/lib/api/customers.ts`
- `src/components/customers/customer-workspace.tsx`
- possibly a new hook under `src/hooks/`

---

## 5. Issue #12 — "Filtered export" only exports the current page (MEDIUM-HIGH)

### Problem
`export-modal.tsx` copy says:

> "Exports current view dataset ({filteredCustomers.length} records)"

implying the entire filtered result set, but `filteredCustomers` is passed in as `data?.data || []` — the current page only. If a filter matches 120 of 200 customers and the page size is 10, "Export filtered customers" exports 10 rows instead of 120.

### Current code
`src/components/customers/customer-workspace.tsx`
```ts
<ExportModal
  filteredCustomers={data?.data || []}
  selectedCustomers={(data?.data || []).filter((c) => selectedCustomerIds.includes(c.id))}
  ...
/>
```

### Required fix
`listCustomers` already computes the full filtered (pre-pagination, post-filter) array internally — it just never leaves the function. Expose it:

`src/lib/api/customers.ts`
```ts
export async function listAllFilteredCustomers(
  params: Omit<CustomerListParams, 'page' | 'pageSize'> = {}
): Promise<Customer[]> {
  await simulateLatency();
  checkErrorInjection();
  return MOCK_CUSTOMERS_STORE.filter((customer) => matchesAllFilters(customer, params))
    .sort(/* reuse the same sort logic as listCustomers, extracted into a shared helper */);
}
```

To avoid duplicating the sort logic, extract the sort block from `listCustomers` into a shared `sortCustomers(customers, sortBy, sortOrder)` helper used by both functions.

In the UI, fetch this unpaginated filtered set **on demand** when the Export modal opens (not on every keystroke/page change), using the current filter params minus `page`/`pageSize`, and pass that into `ExportModal` as `filteredCustomers` instead of `data?.data`.

### Acceptance criteria
- [ ] With a filter that matches more customers than one page (e.g. 120 of 200) and page size 10, "Export filtered customers" produces a CSV with **120** rows, not 10.
- [ ] With no filters applied, "Export filtered customers" exports all 200 customers.
- [ ] The count shown in the modal ("Exports current view dataset (N records)") matches the actual number of exported rows.

### Files touched
- `src/lib/api/customers.ts`
- `src/components/customers/customer-workspace.tsx`
- `src/components/customers/export-modal.tsx` (only if the prop/loading contract changes, e.g. to support an async fetch-on-open)

---

## 6. Issue #14 — `phone-input.tsx`: effect-driven state sync causes an extra render

### Problem
```ts
useEffect(() => {
  const { country, localNumber: num } = parseInitial(value);
  setSelectedCountry(country);
  setLocalNumber(num);
}, [value]);
```

This runs: `value` changes → render → effect fires → `setState` → second render. It's not breaking functionality today, but it's unnecessary synchronization, and it's exactly the pattern the React Compiler flags. For a controlled/semi-controlled component like this, internal state should be derived from props rather than re-synced via an effect.

### Required fix
Derive the parsed value from `value` directly instead of storing a redundant copy of it in state that has to be kept in sync:

```tsx
export function PhoneInput({ value = '', onChange, disabled = false, className }: PhoneInputProps) {
  const parseInitial = (val: string) => {
    if (!val) return { country: COUNTRY_CODES[0], localNumber: '' };
    const matchedCountry = COUNTRY_CODES.find((c) => val.startsWith(c.dialCode));
    if (matchedCountry) {
      return { country: matchedCountry, localNumber: val.slice(matchedCountry.dialCode.length).trim() };
    }
    return { country: COUNTRY_CODES[0], localNumber: val };
  };

  // Derived directly from props — no effect needed for the common case.
  const { country: derivedCountry, localNumber: derivedLocalNumber } = parseInitial(value);

  // Local override state only for in-progress typing/country selection that hasn't
  // propagated back through `value` yet (component is used as semi-controlled).
  const [override, setOverride] = useState<{ country: CountryCode; localNumber: string } | null>(null);

  const selectedCountry = override?.country ?? derivedCountry;
  const localNumber = override?.localNumber ?? derivedLocalNumber;

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
    setOverride({ country, localNumber });
    const combined = localNumber.trim() ? `${country.dialCode} ${localNumber.trim()}` : '';
    onChange?.(combined);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setOverride({ country: selectedCountry, localNumber: raw });
    const combined = raw.trim() ? `${selectedCountry.dialCode} ${raw.trim()}` : '';
    onChange?.(combined);
  };

  // Reset the local override once `value` genuinely changes to something that
  // no longer matches what we last emitted (e.g. external reset/programmatic set).
  useEffect(() => {
    setOverride(null);
  }, [value]);

  // ...rest of the render unchanged, using selectedCountry/localNumber
}
```

This still uses one `useEffect`, but only to *clear* a local override when the external `value` genuinely changes — it no longer duplicates parsing/state-setting logic that runs on every prop change. If the take-home reviewer prefers a fully effect-free version, an acceptable simpler alternative is to make the component fully uncontrolled internally and only re-derive on `key`-based remounts (e.g. parent passes `key={customerId}` when swapping which record is being edited), removing the `useEffect` entirely. Either approach is acceptable; the important part is not calling `setState` synchronously in response to every `value` prop tick when the component's own `onChange` is the one driving `value` in the first place.

### Acceptance criteria
- [ ] React Compiler / lint no longer flags this `useEffect` pattern.
- [ ] Typing in the phone number field still updates the field and calls `onChange` correctly.
- [ ] Switching country updates the dial code and combined value correctly.
- [ ] Loading a customer with an existing phone number still correctly pre-populates country + local number.
- [ ] No visible double-render/flicker when `value` changes externally (e.g. switching between customer records).

### Files touched
- `src/components/ui/phone-input.tsx`

---

## 7. Issue #15 — `catch (err: any)` in `saved-views.tsx`

### Problem
```ts
} catch (err: any) {
  setError(err.message);
}
```
`any` defeats type-safety, and `err.message` will throw if the caught value isn't an `Error` (e.g. a thrown string).

### Required fix
`src/components/customers/saved-views.tsx`
```ts
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unable to save view');
}
```

### Acceptance criteria
- [ ] No `any` type remains in the catch clause.
- [ ] Saving a view with a duplicate/invalid name still shows the correct error message in the dialog.
- [ ] `tsc`/ESLint no longer flag this block.

### Files touched
- `src/components/customers/saved-views.tsx`

---

## 8. Suggested Execution Order & Verification

1. **#10 → #11 → #12** together, since they share the same data-layer change (expose unpaginated/filtered data from `src/lib/api/customers.ts`). Verify manually with a dataset where filters split results across multiple pages (e.g. filter to a status that matches 30+ of the 200 seeded customers with page size 10).
2. **#14**, verified by manually toggling between two customer records with different phone numbers in the form, and confirming no extra render/flicker plus correct pre-population.
3. **#15**, quick fix, verified by triggering the duplicate-name validation error in the Save View dialog.

## 9. Out of Scope
- No new features (e.g. no new filter types, no new export formats).
- No redesign of Saved Views drag-and-drop or Company filter UI — only the data source feeding them.
- No changes to `phone-input.tsx`'s visual design or supported country list.