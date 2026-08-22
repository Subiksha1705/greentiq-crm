# Greentiq Advanced CRM Dashboard — Build PRD (Antigravity Execution Spec)

**Version 3** — v2 closed the routing/stats/date/filter/saved-view-identity gaps; v3 closes the remaining ambiguities: Recent Contacts' definition, explicit payloads for every predefined view, the Phase 6→9 dashboard-verification ordering, deterministic mock error injection, pagination-reset rules, Follow-up Risk sort order, and a few precision fixes (URL-as-source-of-truth, calendar-date Zod comparison, Vitest as the test runner, today-as-default in the Last Contact picker). See §0.4 Changelog.

**Role:** Frontend Engineer take-home assignment
**Stack (mandatory):** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · dnd-kit · React Hook Form · Zod
**Data:** Mock service layer + seeded mock data (no real backend, no auth, no HTTP routes)
**Deployment:** Vercel
**Evaluation focus:** code architecture, repo structure, reusable components, UI quality, filter correctness, state management

---

## 0. How This PRD Must Be Executed

This is a **gated, checkpoint-driven execution plan**. Follow this protocol exactly.

### 0.1 Execution Rules

1. Work through **Phases in order** (Section 4 onward). Do not skip ahead.
2. Each Phase has a **fixed scope** — build only what is listed under that Phase. Do not pull in functionality from a later Phase "while you're in there."
3. When a Phase is complete, **STOP**. Do not start the next Phase automatically.
4. At the stop point, post a **Phase Completion Report** (format in §0.2).
5. Wait for one of the following explicit commands from me before continuing:
   - `approved, continue` → move to next Phase
   - `fix: <notes>` → apply fixes, re-report, wait again
   - `skip <phase>` → only if I explicitly say so
6. Never mark a Definition-of-Done checkbox complete unless it was actually implemented and manually verified in this session — no speculative checking.
7. If a requirement is still ambiguous after reading this document in full, make the smallest reasonable assumption, state it explicitly in the Phase Completion Report under "Assumptions," and proceed — do not block on it. (This PRD has been revised specifically to remove the ambiguities that would otherwise force this.)
8. If you get stuck on one sub-feature for too long, park it, note it as `⚠️ deferred` in the report, and continue with the rest of the Phase. Never let one blocker stall an entire Phase.
9. **Priority discipline (§1):** if time runs short, protect P0 before P1, and P1 before P2. Never trade P0 quality for P2 features.

### 0.2 Phase Completion Report — Required Format

```
### ✅ Phase N Complete — <Phase Name>

**What was built:**
- ...

**Files added/changed:**
- ...

**Checklist status:**
- [x] item
- [x] item
- [ ] item (deferred — reason)

**How to verify locally:**
1. ...
2. ...

**Assumptions made:**
- ...

**Known limitations / TODO for later phases:**
- ...

Waiting for your review before continuing to Phase N+1.
```

### 0.3 Non-Negotiables Across All Phases

- No feature from a later phase is implemented early, even partially.
- No duplicate logic — if something exists in `lib/` or `hooks/`, reuse it, don't reimplement it inline.
- No business logic inside JSX/components — §6 defines exactly where logic lives.
- No new dependency without a one-line justification in the Phase Completion Report.
- Every new UI element must use shadcn/ui primitives where one exists — don't hand-roll a button/input/dialog.
- TypeScript strict mode stays on. No `any` unless justified in a comment.
- Commit at the end of each Phase (see §12), not one giant commit at the end.
- The repo tree in §3 is the **expected baseline**, not an immutable seal — new files may be added when a Phase genuinely needs them, but every addition must be named in that Phase's Completion Report with a one-line reason. Do not add files silently, and do not treat the tree as a hard ceiling that blocks a Phase from doing its job.

### 0.4 Changelog (v1 → v2 → v3)

**v1 → v2** closed the first review pass: `/` is now the Dashboard route (not a redirect to `/customers`); added `getCustomerStats()` as a first-class API function with its own query key; defined calendar-day semantics for risk calculation; defined OR-within-type / AND-across-type filter semantics, inclusive date ranges, and case-insensitive substring search; committed to an **Apply**-based filter drawer (not real-time); defined saved-view selection identity and custom-view naming rules; defined a single persistence model per state type; clarified mutation invalidation policy explicitly, including dashboard stats; trimmed the data model and marked Notes/Interactions as read-only for this assignment; picked one Update Last Contact UI pattern and disallowed future dates; defined CSV columns; made accessibility contrast measurable (WCAG AA); added a minimal unit-testing requirement for business rules; added a `CustomerWorkspace` client boundary so `page.tsx` stays a thin server shell; and added the Priority Hierarchy (§1).

**v2 → v3** closes the second review pass: defined "Recent Contacts" precisely and gave every predefined saved view an explicit filter payload (§7.5); removed the Phase 6→Phase 9 forward dependency by deferring Dashboard-count verification to Phase 9 while keeping the invalidation itself in Phase 6/8; required `getCustomerStats().needsAttention` to call `isNeedsAttention()` rather than reimplementing the predicate; defined a single pagination-reset rule (any committed filter/search/page-size change resets to page 1); defined the Follow-up Risk sort order (`low < medium < high`) and required date sorting/filtering to compare normalized calendar dates, never display strings; made the mock error path a deterministic test-only toggle instead of "occasional"; clarified that only the *debounced* search value is committed to the URL, never every keystroke; declared URL search params the source of truth for URL-backed state; required Zod's not-in-future check to compare calendar dates (matching `getFollowUpRisk`'s semantics) rather than raw timestamps; tightened the wording on custom-saved-view persistence (survives in-app navigation, not a full page reload); picked **Vitest** as the required test runner; and defined the Last Contact date picker's default selection as today's date.

---

## 1. Priority Hierarchy (read this before building anything)

If time runs out, this is the order in which things must still be excellent vs. merely present vs. cut.

**P0 — Must be excellent, never compromised:**
- Follow-up Risk calculation (correct, calendar-day based)
- Needs Attention view
- Advanced Filters (all 6 types, correct combination semantics)
- Customer table (search, sort, pagination)
- Update Last Contact → risk recalculates → Needs Attention membership updates live
- TanStack Query architecture (caching, loading, error, invalidation)

**P1 — Required, must work correctly, can be visually simpler if squeezed:**
- Full CRUD (add/edit/delete)
- Saved views (predefined + custom, including drag-to-reorder)
- Dashboard KPIs
- Responsive layout + accessibility basics
- Loading/empty/error states everywhere

**P2 — Bonus, build only after all P0 and P1 are solid:**
- CSV export
- Command palette (⌘K)
- Dark/light mode
- Bulk actions
- Optimistic updates

Saved-view drag-and-drop (dnd-kit) satisfies the assignment's mandatory DnD-library requirement, but it is **not** the product differentiator — it must never be allowed to delay or dilute the P0 Follow-up Risk workflow. If Phase 5 (§4) is running long, ship a functioning but visually simple reorder before polishing it further.

---

## 2. Product Summary

Greentiq's CRM Dashboard is a **customer workspace**, not a generic CRUD table. The core loop:

```
Search / Filter → Understand customer status → Spot customers needing attention
→ Open customer → Update Last Contact → Risk recalculates → workflow closes the loop
```

The signature feature is **Follow-up Risk** — a transparent, rule-based indicator derived from `lastContactDate`. This is a business rule, **not AI**, and must never be described or coded as a prediction of churn/behavior.

### 2.1 Risk Calculation — Exact Semantics (binding)

- Risk is computed from the **calendar-day difference** between `today` and `lastContactDate`, using local calendar dates. **Time-of-day is ignored** — normalize both dates to midnight before diffing.
- `daysSinceContact = calendarDate(today) - calendarDate(lastContactDate)`, in whole days.
- Buckets:

| daysSinceContact | Risk   |
|---|---|
| 0–7   | Low    |
| 8–30  | Medium |
| 31+   | High   |

- **Future dates are disallowed at the input layer** (§9.6, §10) — the Last Contact date picker must not allow selecting a date later than today. As a defensive fallback inside `getFollowUpRisk`, if a future date is ever encountered, clamp `daysSinceContact` to `0` (never produce a negative number or throw).
- `RiskLevel` is always **derived**, never stored on the `Customer` object — see §5.

---

## 3. Repo Structure

```
greentiq-crm/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Dashboard route ("/")
│   │   ├── globals.css
│   │   └── customers/
│   │       └── page.tsx                 # thin server shell → renders <CustomerWorkspace />
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui generated primitives
│   │   │
│   │   ├── common/                      # Layer 2 — shared app components (domain-agnostic)
│   │   │   ├── page-header.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── loading-state.tsx        # supports variant="table" | "card" | "detail" — this IS the table skeleton, no separate CustomerTableSkeleton file
│   │   │   ├── filter-chip.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── form/
│   │   │       ├── form-field.tsx
│   │   │       ├── text-field.tsx
│   │   │       ├── select-field.tsx
│   │   │       ├── multi-select-field.tsx
│   │   │       ├── date-field.tsx
│   │   │       ├── date-range-field.tsx
│   │   │       └── textarea-field.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── app-shell.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── topbar.tsx
│   │   │
│   │   └── customers/                   # Layer 3 — domain components
│   │       ├── customer-workspace.tsx   # 'use client' orchestrator: toolbar + filters + table + drawer
│   │       ├── customer-table.tsx
│   │       ├── customer-row.tsx
│   │       ├── customer-toolbar.tsx
│   │       ├── customer-filters.tsx
│   │       ├── customer-form.tsx
│   │       ├── customer-details.tsx
│   │       ├── saved-views.tsx
│   │       ├── follow-up-risk-badge.tsx
│   │       ├── bulk-actions-bar.tsx
│   │       └── command-palette.tsx
│   │
│   ├── hooks/
│   │   ├── use-customers.ts             # list query (filters, sort, pagination as query key)
│   │   ├── use-customer.ts              # single customer query
│   │   ├── use-customer-stats.ts        # dashboard KPI query
│   │   ├── use-create-customer.ts
│   │   ├── use-update-customer.ts
│   │   ├── use-delete-customer.ts
│   │   ├── use-customer-filters.ts      # committed + draft filter state (URL-backed)
│   │   ├── use-saved-views.ts
│   │   └── use-debounced-value.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   └── customers.ts             # mock service layer — the ONLY place that touches mock-data. No Next.js Route Handlers, no /api/* — see §5.1
│   │   ├── validations/
│   │   │   └── customer.ts              # zod schemas
│   │   ├── customer-rules.ts            # getFollowUpRisk(), isNeedsAttention(), filter-matching predicates
│   │   ├── csv.ts                       # CSV export logic
│   │   ├── query-client.ts
│   │   ├── query-keys.ts                # single source of truth for all TanStack Query keys
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── customer.ts
│   │
│   └── data/
│       └── mock-customers.ts            # seed data generation (150–250 customers)
│
├── .env.example
├── README.md
└── package.json
```

---

## 4. Phase Plan (build strictly in this order)

| Phase | Name | Depends on |
|---|---|---|
| 1 | Project Foundation & Design System Shell | — |
| 2 | Data Layer — Types, Seed Data, Mock Service, Business Rules, Query Keys | 1 |
| 3 | Customer Table — List, Search, Sort, Pagination | 2 |
| 4 | Advanced Filters Panel + Chips (Apply model — Key Feature) | 3 |
| 5 | Saved Views + Needs Attention + Drag-to-Reorder | 4 |
| 6 | Customer Details Drawer + Update Last Contact loop | 5 |
| 7 | Customer Add/Edit Form + Delete Flow (CRUD complete) | 6 |
| 8 | TanStack Query Hardening (loading/error/cache/invalidation pass) | 7 |
| 9 | Dashboard (`/` route, KPI cards via `getCustomerStats()`) | 8 |
| 10 | Bonus Features — CSV export, ⌘K, dark/light, bulk actions | 9 |
| 11 | Responsive & Accessibility Pass | 10 |
| 12 | Polish, Empty/Loading/Error states everywhere | 11 |
| 13 | Unit tests, README, Testing Pass, Vercel Deployment, Final DoD Audit | 12 |

---

## Phase 1 — Project Foundation & Design System Shell

### Requirements
- Next.js App Router project, TypeScript strict, Tailwind, shadcn/ui initialized.
- TanStack Query provider wired at root.
- Routing decided now and not revisited: **`/` = Dashboard**, **`/customers` = Customer workspace**. Sidebar nav: "Dashboard" → `/`, "Customers" → `/customers`.
- App shell: sidebar, topbar (search bar placeholder, no logic yet).
- Base shadcn components installed: Button, Input, Table, Badge, Dialog, Drawer/Sheet, Select, Checkbox, Popover, Calendar, Tooltip, Toast/Sonner, Command, Skeleton.
- Global typography scale, spacing scale, color tokens documented in `globals.css`.

### Implementation Instructions
1. `npx create-next-app@latest` with TS, Tailwind, App Router, `src/` dir, alias `@/*`.
2. `npx shadcn@latest init`, then add the components listed above one at a time.
3. Create `lib/query-client.ts` (configured `QueryClient`) and `lib/query-keys.ts` (empty scaffold, populated in Phase 2) — wrap `app/layout.tsx` in a client `Providers` component (`QueryClientProvider` + Toaster).
4. Build `components/layout/app-shell.tsx`, `sidebar.tsx`, `topbar.tsx` — static shell only, no data.
5. `app/page.tsx` renders shell + a "Dashboard" placeholder heading only (real KPIs come in Phase 9). `app/customers/page.tsx` renders shell + a "Customers" placeholder heading (real content starts Phase 3).
6. Set up ESLint + Prettier + strict `tsconfig`.

### Acceptance Checklist
- [ ] `npm run dev` runs clean, no console errors
- [ ] `npm run build` succeeds
- [ ] TypeScript strict mode on, zero errors
- [ ] `/` renders Dashboard placeholder, `/customers` renders Customers placeholder — confirmed as final routing, not to be revisited later
- [ ] shadcn primitives installed and importable
- [ ] TanStack Query Provider wired
- [ ] Color palette + spacing tokens documented

**→ STOP. Produce Phase 1 Completion Report. Wait for `approved, continue`.**

---

## Phase 2 — Data Layer: Types, Seed Data, Mock Service, Business Rules, Query Keys

### Requirements
- `types/customer.ts`: `Customer`, `CustomerStatus`, `RiskLevel`, `Interaction`, filter/sort param types, `CustomerStats`.
- `data/mock-customers.ts`: deterministic seed generator, 150–250 customers, `lastContactDate` spread across 0–90 days so all three risk buckets are represented, held in an in-memory module-level store so mutations persist for the session.
- `lib/customer-rules.ts`: pure functions, zero React/JSX:
  - `getFollowUpRisk(lastContactDate: Date, today?: Date): RiskLevel` per §2.1 calendar-day semantics.
  - `isNeedsAttention(customer): boolean` = `status === 'active' && getFollowUpRisk(...) === 'high'`.
  - Filter-matching predicates implementing the semantics in §7.
- `lib/api/customers.ts` — the mock **service layer** (not an HTTP API, see §5.1): `listCustomers(params)`, `getCustomer(id)`, `createCustomer(input)`, `updateCustomer(id, input)`, `deleteCustomer(id)`, `getCustomerStats(): Promise<CustomerStats>`, plus a deterministic test-only error toggle (see §5.2). Simulate 300–600ms latency. This is the **only** file allowed to import `data/mock-customers.ts`.
- `lib/query-keys.ts`: centralized key factory, e.g. `customerKeys.lists()`, `customerKeys.list(params)`, `customerKeys.detail(id)`, `customerKeys.stats()` — every hook imports from here, nobody hand-writes an array literal key.
- `lib/validations/customer.ts`: Zod schema shared by create and edit, including a refinement that `lastContactDate` cannot be later than today, compared as a **calendar date** (see §5.3), not a raw timestamp.

### 5.2 Mock Error Injection — Deterministic Contract (binding)

The mock service must expose a single, explicit, test-only toggle — not a random failure rate. Example shape:

```ts
// lib/api/customers.ts
export function setMockApiErrorMode(mode: 'off' | 'next' | 'all'): void
```

- `'off'` (default): normal operation, zero random failures, ever.
- `'next'`: the very next service call rejects, then mode auto-resets to `'off'`.
- `'all'`: every service call rejects until explicitly turned back `'off'`.

This is what Phase 8's manual error/Retry verification and Phase 13's regression script use — there is no other error-inducing mechanism anywhere in the app (no random flakiness during normal use).

### 5.3 Calendar-Date Comparison Rule (binding)

Anywhere a date is compared against "today" or against another date for filtering, sorting, risk, or validation — including the Zod not-in-future check — comparisons must use the same **normalized local calendar date** helper as `getFollowUpRisk` (§2.1), not raw `Date`/timestamp comparison. Two `Date` values on the same calendar day, regardless of time-of-day, must always be treated as equal. Put this normalization helper once in `lib/utils.ts` (e.g. `toCalendarDate(date): Date`) and have `customer-rules.ts` and `validations/customer.ts` both call it — do not reimplement it in each file.

### Implementation Instructions
1. Define `Customer` type per the trimmed data model in §5.
2. `getFollowUpRisk` implemented exactly per §2.1 — include the inline comment: "Contact-recency rule, not a prediction — do not rename to AI/ML anything."
3. `getCustomerStats()` computes `{ total, active, inactive, needsAttention }` over the **full** in-memory dataset, never a paginated slice.
4. Zod schema: name required, email format, phone format, company optional, status enum, `lastContactDate` required + not-in-future, notes optional.

### Acceptance Checklist
- [ ] `Customer` type matches §5 exactly (no extra speculative fields)
- [ ] 150–250 seeded customers exist, spread across Low/Medium/High risk
- [ ] `getFollowUpRisk` covers boundary cases correctly (7→Low, 8→Medium, 30→Medium, 31→High) and clamps future dates to 0 days
- [ ] `isNeedsAttention` implemented via `getFollowUpRisk`, not duplicated logic
- [ ] `getCustomerStats()` returns correct totals against the full dataset, independent of any pagination/filter state
- [ ] `getCustomerStats().needsAttention` is computed by calling `isNeedsAttention()` per customer — not by reimplementing the status/risk predicate inline
- [ ] `lib/query-keys.ts` exists and is the sole source of query key arrays
- [ ] Mock service functions are async, simulate latency, and are the sole data-access point — confirm no `/api/*` route files were created
- [ ] `setMockApiErrorMode('off' | 'next' | 'all')` implemented exactly per §5.2; default is `'off'` with zero random failures during normal use
- [ ] Zod schema validates required fields, email/phone formats, and rejects future `lastContactDate` using the calendar-date helper from §5.3 (not raw timestamp comparison)

**→ STOP. Produce Phase 2 Completion Report. Wait for `approved, continue`.**

---

## Phase 3 — Customer Table: List, Search, Sort, Pagination

### Requirements
- Table columns: Name, Email, Phone, Company, Status, Last Contact, Follow-up Risk.
- Debounced search (300ms) across name/email/company. Search is **case-insensitive, trimmed, substring match**. (Not called "real-time" — it is intentionally debounced, not instant.) Only the **debounced** value is ever committed to the URL/query — the raw keystroke-by-keystroke value stays local to the input component and never triggers a `router.replace()` or a query key change.
- Column sorting: name, email, last contact date, follow-up risk. Sort state independent from filter state.
  - Follow-up Risk sort order is **`low < medium < high`** (not alphabetical) — sort by each risk's rank index (0/1/2), never by the string itself.
  - Last Contact sorting/filtering always compares normalized calendar-date values (§5.3), never the formatted display string ("14 days ago", "Aug 22, 2026", etc.).
- Pagination: 10/25/50 per page, reusable `<DataTablePagination />`.
- `use-customers.ts` query key built from `customerKeys.list(params)`, where `params` includes search/sort/page/pageSize (filters added in Phase 4).
- `app/customers/page.tsx` stays a thin server component that renders `<CustomerWorkspace />`; all interactivity (`'use client'`, `useSearchParams`, hooks) lives inside `components/customers/customer-workspace.tsx` and its children.

### Implementation Instructions
1. `hooks/use-debounced-value.ts` — generic debounce hook, 300ms default.
2. `components/common/search-input.tsx` — controlled input, raw value shown immediately for responsive typing, debounced value emitted upward; only that debounced value reaches `use-customer-filters`/the URL.
3. `hooks/use-customers.ts` — `useQuery({ queryKey: customerKeys.list(params), queryFn: () => listCustomers(params) })`.
4. `components/customers/customer-workspace.tsx` — client component that owns overall page composition (toolbar, table, drawer slot) so `page.tsx` stays a thin server shell.
5. `components/customers/customer-table.tsx` / `customer-row.tsx` — shadcn `Table`, sortable headers, uses `StatusBadge` and `FollowUpRiskBadge`.
6. `components/common/data-table-pagination.tsx` — page size select + prev/next + page numbers, fully domain-agnostic.
7. `follow-up-risk-badge.tsx` accepts a **derived `RiskLevel`** computed by the caller via `getFollowUpRisk(customer.lastContactDate)` — it never accepts a stored `customer.risk` field, because no such field exists on `Customer` (see §5, §8).
8. Loading state for the table uses `<LoadingState variant="table" />` — no separate skeleton component.

### Acceptance Checklist
- [ ] Table renders all required columns with real seed data
- [ ] Search matches name, email, and company; case-insensitive, trimmed, substring; debounced 300ms; verified no request fires per keystroke and the URL only updates once typing pauses, not per keystroke
- [ ] Sorting works for name, email, last contact, follow-up risk (asc/desc); Follow-up Risk sorts `low < medium < high`, confirmed not alphabetical
- [ ] Last Contact sort compares actual calendar dates, not display strings
- [ ] Sort state and filter state are separate (filter seam exists, filters built next phase)
- [ ] Pagination supports 10/25/50; any new search, filter change, or page-size change resets to page 1 (see §7.6 for the full pagination-reset rule)
- [ ] `<LoadingState variant="table" />` shown while fetching
- [ ] `page.tsx` contains no hooks/client logic; all of it lives in `CustomerWorkspace`
- [ ] No `fetch()`/`axios` call exists outside `lib/api/customers.ts`; no `/api/*` route created

**→ STOP. Produce Phase 3 Completion Report. Wait for `approved, continue`.**

---

## Phase 4 — Advanced Filters Panel + Chips (Apply model — Key Feature)

### Requirements
Right-side drawer/panel with: Status (checkboxes), Company (multi-select), Last Contact date range (From/To), Phone (partial match), Email (partial match), Follow-up Risk (checkboxes).

**Interaction model — decided, not left to the implementer:** the drawer uses an explicit **Apply** button.
- Changes made inside the drawer are **draft** state until Apply is clicked.
- Clicking Apply commits draft → committed filters, which drive the query and the chips.
- Closing the drawer (X, overlay click, Esc) **without** Apply discards the draft and reverts to the last committed state.
- **Clear All** immediately clears the committed filters (it is not a draft action).

### Filter Semantics (binding — see full detail in §7)
- Within one filter type: **OR** (e.g. Status = Active + Inactive → active OR inactive).
- Across filter types: **AND**.
- Date range boundaries are **inclusive**; From-only means `>= From`; To-only means `<= To`.
- Dedicated Email/Phone filters are **exact-field substring filters**, combined with global search via **AND** (see §7.3 for the worked example).

### Implementation Instructions
1. `hooks/use-customer-filters.ts` — holds both **draft** and **committed** filter state. Committed state is URL-backed (`useSearchParams` + `router.replace`) so it survives refresh; draft state is local to the open drawer session.
2. `components/customers/customer-filters.tsx` — drawer UI built from the `form/*` primitives; Apply commits draft → URL; Clear All resets both draft and committed.
3. `components/common/filter-chip.tsx` — generic `{label, onRemove}`, reused for every filter type; removing a chip updates **committed** state directly (bypasses the draft/Apply step, since it's a direct removal, not a drawer edit).
4. Wire committed filters into `use-customers.ts`'s query params via `customerKeys.list(params)`.
5. Filter-matching logic lives in `lib/customer-rules.ts` (see §6) — not inline in the component.

### Acceptance Checklist
- [ ] All 6 filter types implemented and functioning individually
- [ ] Within-type OR confirmed (e.g., Risk = Low + High returns both)
- [ ] Across-type AND confirmed (Status=Active AND Company=Acme AND Risk=High → correct intersection)
- [ ] Date range inclusive on both boundaries; From-only and To-only both work
- [ ] Email/Phone filters combine with global search via AND (test the §7.3 worked example)
- [ ] Draft changes in the drawer do nothing until Apply is clicked
- [ ] Closing the drawer without Apply discards draft changes
- [ ] Clear All immediately clears committed filters (no Apply needed)
- [ ] Active filter count badge accurate at all times; chips reflect every committed filter
- [ ] Applying a new filter combination (or removing a chip, or Clear All) resets pagination to page 1 (§7.6)
- [ ] Committed filter state survives a page refresh (URL-driven)
- [ ] No filter-matching logic duplicated between drawer, chips, and query layer

**→ STOP. Produce Phase 4 Completion Report. Wait for `approved, continue`.**

---

## Phase 5 — Saved Views + Needs Attention + Drag-to-Reorder

### Requirements
- Predefined views, each defined by an **exact filter payload** (§7.5) — no view's matching logic is left implicit:

| View | Filter payload |
|---|---|
| All Customers | `{}` (no filters) |
| Active Customers | `{ status: ['active'] }` |
| Recent Contacts | `{ lastContactFrom: today - 7 calendarDays, lastContactTo: today }` (inclusive, recomputed against "today" every time the view is applied — see §7.5) |
| Needs Attention | `{ status: ['active'], risk: ['high'] }` |
| Inactive Customers | `{ status: ['inactive'] }` |

All five are non-deletable.
- **View selection identity (binding):** a saved view (predefined or custom) is shown as "selected" in the UI **only when the current committed filter state exactly matches its saved filter payload**. Any manual change to a committed filter clears the active-view highlight — the view list shows nothing selected in that case. Do not try to guess or re-derive "closest matching view."
- Custom saved views: user can save the current committed filter combination under a name.
  - Name: required, trimmed, 1–40 characters, duplicate names rejected (case-insensitive compare against existing custom view names).
  - Saving an unfiltered (empty) state is allowed.
- **Drag-and-drop reordering of saved views** via `dnd-kit` (mouse + keyboard sensor).
- Per §1, this phase must not run long at the expense of P0 work — ship a working reorder before polishing it.

### Implementation Instructions
1. `hooks/use-saved-views.ts` — holds predefined + custom views (in-memory, survives navigation between routes within the running app, does **not** survive a full page reload — see §7.7), an order array, `saveCurrentAsView(name)` with the validation rules above, `reorder(fromIndex, toIndex)`, and a `selectedViewId` computed by exact-match comparison against current committed filters (not stored — derived every render).
2. `components/customers/saved-views.tsx` — `☰` drag handles using `@dnd-kit/core` + `@dnd-kit/sortable`; selecting a view calls the committed-filter setters from `use-customer-filters` directly (bypassing draft/Apply, same as chip removal — selecting a view is a direct commit).
3. All five predefined views (table above) and Needs Attention specifically are just saved views with a fixed payload — no special-casing beyond being pinned/non-deletable. Recent Contacts' `lastContactFrom` is computed relative to "today" at selection time, not stored as a fixed date.

### Acceptance Checklist
- [ ] All 5 predefined views present and each matches its exact payload from the table above (spot-check Recent Contacts against a customer at exactly 7 and exactly 8 days)
- [ ] Selecting Needs Attention updates filters/chips/count identically to manually setting Active+High
- [ ] Highlighted view clears the instant a committed filter is changed outside the saved-views list
- [ ] User can save current filter combo with a validated name (empty/too-long/duplicate all rejected with a clear message)
- [ ] Saving an unfiltered state works
- [ ] Saved views reorder via mouse drag and via keyboard
- [ ] Reordered order and custom views persist while navigating between routes in the running app; a full page reload resetting them is expected and acceptable
- [ ] Predefined views cannot be deleted; custom views can be

**→ STOP. Produce Phase 5 Completion Report. Wait for `approved, continue`.**

---

## Phase 6 — Customer Details Drawer + Update Last Contact Loop (core differentiator)

### Requirements
- Clicking a row opens a large right-side drawer: avatar/initials, name, title, company, status, Edit/Delete actions, contact info, Last Contact, Follow-up Risk badge, Notes/Interactions (**read-only in this assignment** — no add/edit/delete of individual interactions, displayed in reverse-chronological order).
- **Update Last Contact UI — decided, single pattern:** a date picker (shadcn `Calendar` + `Popover`) that **defaults its selected value to today's date** (not the customer's existing Last Contact date — the common action is "I contacted them today"), plus an explicit **"Update"** button. No inline-editable-text alternative. The date picker must disallow selecting any date later than today (§2.1, §9.6).
- Updating Last Contact must: run a mutation → invalidate the relevant caches (per the §Phase 8 policy, including `customerKeys.stats()`) → risk recalculates in the drawer **and** the table row **and** removes the customer from Needs Attention if it no longer qualifies — all without a manual page reload. **Note:** the Dashboard *invalidation* is wired here (its query key is invalidated correctly), but the Dashboard *UI itself* doesn't exist until Phase 9 — verifying that the KPI numbers visually update is a Phase 9 acceptance item, not a Phase 6 one. Don't build any Dashboard UI early to satisfy this.

### Implementation Instructions
1. `hooks/use-customer.ts` — `useQuery({ queryKey: customerKeys.detail(id), ... })`.
2. `hooks/use-update-customer.ts` — `useMutation`, `onSuccess` invalidates per the policy in §6 (all `customers` list variants + the specific `customer` detail + `customer-stats`).
3. `components/customers/customer-details.tsx` — Sheet/Drawer, sections per §9's layout, "Update Last Contact" = date picker + Update button as decided above.
4. Manually verify the loop available at this point in the build: set a customer to 40+ days old → confirm High + appears in Needs Attention → update Last Contact (defaults to today, confirm future dates are blocked) → confirm it recalculates to Low and disappears from Needs Attention, all without refresh. Confirm via devtools that `customerKeys.stats()` was invalidated by the mutation, even though there's no Dashboard UI yet to visually check it against — that visual check is deferred to Phase 9's acceptance checklist.

### Acceptance Checklist
- [ ] Drawer opens on row click, large right-side panel, closes on X/overlay/Esc
- [ ] Notes/Interactions render read-only, reverse-chronological
- [ ] Update Last Contact uses the date-picker-plus-Update-button pattern, defaults to today's date, future dates are not selectable
- [ ] Updating Last Contact triggers mutation + invalidation of list variants, the detail query, and `customerKeys.stats()` (verify in devtools/network — Dashboard UI check happens in Phase 9, not here)
- [ ] Risk recalculates immediately in the drawer and the table row
- [ ] Customer leaves Needs Attention view automatically once it no longer qualifies
- [ ] Toast confirms successful update

**→ STOP. Produce Phase 6 Completion Report. Wait for `approved, continue`.**

---

## Phase 7 — Customer Add/Edit Form + Delete Flow (CRUD complete)

### Requirements
- One reusable `<CustomerForm mode="create" | "edit" defaultValues?={...} />` — no duplicated forms.
- Fields: Name, Email, Phone, Company, Status, Last Contact Date (not-in-future, per shared Zod schema), Notes.
- React Hook Form + Zod, inline errors, disabled submit while submitting, success/error toasts.
- Delete via reusable `<ConfirmDialog />`, mutation → invalidation (per §6 policy) → toast → drawer closes → list updates.
- **Delete-while-open behavior (binding):** if the customer currently open in the details drawer is deleted, close the drawer and clear the selected-customer id immediately on mutation success.

### Implementation Instructions
1. `components/customers/customer-form.tsx` built entirely from `components/common/form/*` primitives.
2. `hooks/use-create-customer.ts`, `use-delete-customer.ts` mirror Phase 6's mutation/invalidation pattern.
3. `components/common/confirm-dialog.tsx` — generic `{title, description, confirmLabel, onConfirm}`, reused for delete and later for bulk delete (Phase 10).
4. Wire "Add Customer" (toolbar) and "Edit"/"Delete" (drawer) to this form/dialog.

### Acceptance Checklist
- [ ] Add Customer opens `CustomerForm mode="create"`, empty defaults
- [ ] Edit opens the same `CustomerForm mode="edit"` pre-filled — same component, different props
- [ ] Validation: required fields, email/phone format, not-in-future date, all enforced inline
- [ ] Submit disabled while in-flight; success and error toasts both verified (trigger the mock service's error path once)
- [ ] Delete flow uses `ConfirmDialog`
- [ ] Deleting the currently-open customer closes the drawer and clears selection
- [ ] After create/edit/delete: list and stats refetch/update, toast shown
- [ ] No second/duplicate form component exists anywhere in the codebase

**→ STOP. Produce Phase 7 Completion Report. Wait for `approved, continue`.**

---

## Phase 8 — TanStack Query Hardening Pass

### Requirements
- Explicit `staleTime` policy documented and applied consistently.
- Loading states for every query (`<LoadingState variant="..." />` throughout).
- Error states for every query, with Retry, using the deterministic `setMockApiErrorMode()` toggle from §5.2 (never a random failure rate).
- **Invalidation policy (binding):** for any customer create/update/delete mutation, invalidate **all** queries under `customerKeys.lists()` (every filter/sort/page variant), the specific `customerKeys.detail(id)` if applicable, and `customerKeys.stats()`. This is intentional and not considered "over-invalidating" — a single customer change can affect filter membership, sort position, pagination, saved views, and dashboard counts simultaneously, so the minimal *correct* set is the full `lists()` + `stats()` group, not a single query key.
- (Optional, P2) optimistic update on Update Last Contact.

### Implementation Instructions
1. Audit every `useQuery`/`useMutation` call against the hooks list in §3 — confirm none are inlined in components and all use `lib/query-keys.ts`.
2. Add `ErrorState` + Retry wired to `refetch()` for list, detail, and stats queries. Verify by calling `setMockApiErrorMode('next')` (single failed request, then auto-recovers) and `setMockApiErrorMode('all')` (persistent failure until Retry is exercised after switching back to `'off'`).
3. Document `staleTime`/`gcTime` choices with a one-line comment in `query-client.ts`.

### Acceptance Checklist
- [ ] Every data-fetching surface has a loading state and an error state with working Retry
- [ ] Mutations invalidate exactly per the policy above (list variants + detail + stats) — verified in devtools, not just visually
- [ ] No raw `fetch`/`axios` call exists outside `lib/api/customers.ts`
- [ ] staleTime/caching policy documented in code comments

**→ STOP. Produce Phase 8 Completion Report. Wait for `approved, continue`.**

---

## Phase 9 — Dashboard (`/` route)

### Requirements
- `/` renders 4 KPI cards: Total Customers, Active, Inactive, Needs Attention — sourced **exclusively** from `getCustomerStats()` via `hooks/use-customer-stats.ts` (`customerKeys.stats()`), never derived from a paginated table response.
- Clicking the Needs Attention KPI navigates to `/customers` with the Needs Attention saved view applied (reuses Phase 5's view-selection mechanism, e.g. `?view=needs-attention`).
- No fake analytics/charts — keep it lean.

### Implementation Instructions
1. `hooks/use-customer-stats.ts` wraps `getCustomerStats()`.
2. `app/page.tsx` (still a thin server shell) renders a small client KPI section using this hook.
3. Needs Attention card links using the same view-selection mechanism as Phase 5 — reuse, don't reinvent navigation/filter-setting logic.

### Acceptance Checklist
- [ ] 4 KPI cards render correct live counts from `getCustomerStats()`, matching the full dataset, not a page slice
- [ ] Needs Attention card count matches the Needs Attention saved view's result count exactly
- [ ] Clicking it navigates to `/customers` with that view applied
- [ ] Creating/updating/deleting a customer updates the Dashboard counts (confirms Phase 8's `stats()` invalidation)
- [ ] Specifically re-run the Phase 6 Update Last Contact loop now that the Dashboard exists: set a customer to High risk → confirm the Needs Attention KPI includes it → update Last Contact → confirm the KPI count decrements live, closing the loop that Phase 6 deferred
- [ ] No new/duplicate risk or status counting logic introduced outside `customer-rules.ts` / `getCustomerStats()`

**→ STOP. Produce Phase 9 Completion Report. Wait for `approved, continue`.**

---

## Phase 10 — Bonus Features (P2 — only after all P0/P1 are solid)

Build in this order, stop between each:

1. **CSV Export** — exports the **currently filtered/committed** customer set. Columns, in order: `Name, Email, Phone, Company, Status, Last Contact, Follow-up Risk` — matching the table columns exactly, with Follow-up Risk **derived at export time** via `getFollowUpRisk`, never read from a stored field. Logic in `lib/csv.ts`, triggered from the toolbar.
2. **Command palette (⌘K)** — `components/customers/command-palette.tsx`, shadcn `Command`: jump to Dashboard/Customers, jump to saved views, "Add Customer," "Open Filters."
3. **Dark/light mode** — token-based, not per-component overrides.
4. **Bulk actions** — row selection checkboxes, bulk status change, bulk delete (via the same `ConfirmDialog`), bulk export (reuses `lib/csv.ts`).

### Acceptance Checklist (check off what's built)
- [ ] CSV export respects committed filters, columns match exactly the list above, risk is derived not stored
- [ ] ⌘K opens command palette; navigation and action entries work
- [ ] Dark/light toggle switches the whole app consistently, no unstyled flash
- [ ] Bulk select → status change reflects in table + Dashboard KPI counts (confirms stats invalidation extends to bulk paths too)
- [ ] Bulk delete requires confirmation and invalidates cache correctly
- [ ] None of the above broke any Phase 1–9 (P0/P1) functionality — quick smoke test

**→ STOP after each sub-feature you complete. Wait for `approved, continue`.**

---

## Phase 11 — Responsive & Accessibility Pass

### Requirements
- Sidebar collapses on small screens; table becomes horizontally scrollable or card-based on mobile; filters become a full-width drawer on mobile; customer details becomes a full-screen drawer on mobile; toolbar wraps sensibly.
- Keyboard navigation, focus management (drawer/dialog trap focus), labeled inputs, ARIA where needed, keyboard-operable dnd (re-verify Phase 5).
- **Contrast — measurable, not subjective:** all text and interactive controls must meet **WCAG AA** contrast ratios (4.5:1 normal text, 3:1 large text/UI components).

### Acceptance Checklist
- [ ] 375px, 768px, 1024px, 1440px widths all manually checked, no horizontal overflow/broken layout
- [ ] All interactive elements reachable and operable via keyboard only
- [ ] Dialog/drawer focus trap verified (Tab doesn't escape, Esc closes)
- [ ] Form errors and labels are screen-reader associated (`htmlFor`/`aria-describedby`)
- [ ] Text/control contrast checked and meets WCAG AA

**→ STOP. Produce Phase 11 Completion Report. Wait for `approved, continue`.**

---

## Phase 12 — Final Polish

### Requirements
- Consistent spacing/typography audit; empty state (`No customers found` + "Clear Filters") wherever a filtered/searched result is empty; skeletons match real content shape (no layout shift); hover/focus states everywhere; no leftover `console.log`/dead code/unused imports.

### Acceptance Checklist
- [ ] Empty state correct when filters/search produce zero results
- [ ] All loading states match the shape of their real content
- [ ] No console errors/warnings anywhere in the app
- [ ] No unused files/components/exports remain
- [ ] Visual pass: nothing feels like a "tutorial project"

**→ STOP. Produce Phase 12 Completion Report. Wait for `approved, continue`.**

---

## Phase 13 — Unit Tests, README, Testing Pass, Deployment, Final Audit

### Requirements
- **Unit tests** (minimal but required — this is where correctness matters most and manual testing is weakest). Test runner: **Vitest** (`npm run test`), the required choice for this project — do not substitute Jest or another runner.
  - `getFollowUpRisk` boundary cases (0, 7, 8, 30, 31 days; future-date clamp)
  - `isNeedsAttention`
  - `getCustomerStats().needsAttention` matches `isNeedsAttention()` applied across the dataset (no drift between the two)
  - Filter-matching predicates: within-type OR, across-type AND, date-range inclusivity, search+email/phone AND combination
  - Recent Contacts payload correctly includes a customer at exactly 7 days and excludes one at exactly 8 days
  - Sorting comparators, including Follow-up Risk's `low < medium < high` order and calendar-date comparison for Last Contact
- Manual regression pass across all Phases using §10's script.
- README covering: project summary, features (required + bonus, honestly marked), architecture diagram (UI → hooks → TanStack Query → mock service → mock data), reusability notes, Follow-up Risk explanation (explicitly: rule-based, not AI), routing (`/` = Dashboard, `/customers` = workspace), tradeoffs (mock service not HTTP API, saved-view-only DnD, no auth/backend, notes/interactions read-only), local run instructions, Vercel URL.
- Vercel deployment: production build succeeds, deployed, URL works, no console errors in production.
- Final Definition-of-Done audit against §11 in full.

### Acceptance Checklist
- [ ] Vitest configured; `npm run test` runs all unit tests above and they pass
- [ ] README complete per the sections above
- [ ] Full manual regression pass done and logged
- [ ] `npm run build` succeeds with zero TypeScript/lint errors
- [ ] Vercel deployment live and functional
- [ ] Git history is meaningful commits per §12 (no `final`, `final2`, `wip`)
- [ ] Full Definition of Done (§11) reviewed line by line

**→ STOP. Produce final Completion Report + link to live Vercel deployment + repo. Do not consider the project "submitted" until I say `approved, ship it`.**

---

## 5. Data Model (trimmed — do not re-expand)

```ts
type CustomerStatus = 'active' | 'inactive';
type RiskLevel = 'low' | 'medium' | 'high'; // always derived, never stored

interface Interaction {
  id: string;
  note: string;
  date: string; // ISO — read-only for this assignment, no create/edit/delete UI
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;   // ISO, never later than today
  createdAt: string;         // ISO — realism only, not otherwise functionally required
  notes?: string;
  interactions: Interaction[]; // read-only, reverse-chronological display
  jobTitle?: string;          // used in the drawer header; keep
  // dealValue and accountOwner are dropped — not displayed anywhere in this build,
  // so they add data-generation overhead without contributing to the assignment.
}

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  needsAttention: number;
}
```

`RiskLevel` must never be added as a stored field on `Customer` — see §8's badge contract note.

---

## 6. Where Logic Lives (do not violate)

| Logic | Location |
|---|---|
| Follow-up Risk calculation (§2.1 semantics) | `lib/customer-rules.ts` |
| Needs Attention matching | `lib/customer-rules.ts` |
| Filter-matching predicates (§7 semantics) | `lib/customer-rules.ts`, invoked from `lib/api/customers.ts` |
| Sorting comparators | `lib/customer-rules.ts` or a co-located `lib/api/customers.ts` helper |
| Pagination slicing | `lib/api/customers.ts` |
| Form validation | `lib/validations/customer.ts` |
| CSV generation (§9.10 columns) | `lib/csv.ts` |
| Query key construction | `lib/query-keys.ts` — nobody else writes a key array literal |
| Query configuration (staleTime, etc.) | `lib/query-client.ts` + individual `hooks/use-*.ts` |
| Mutation invalidation (§6/Phase 8 policy) | respective `use-create/update/delete-customer.ts` |
| Date math | `lib/customer-rules.ts` / `lib/utils.ts` |

No component file should contain a `switch`/date-diff/filter-predicate that duplicates any of the above.

---

## 7. Filter & Search Semantics (binding contract for Phase 4)

### 7.1 Combination rules
- **Within** a single filter type: values combine with **OR**. E.g. `Status = Active + Inactive` → `active OR inactive`. Same for Company and Risk.
- **Across** different filter types: **AND**. E.g. `(status = active OR inactive) AND (company = Acme OR Microsoft) AND (risk = high OR medium)`.

### 7.2 Date range
- Boundaries are **inclusive**. `From = Aug 1, To = Aug 10` includes both Aug 1 and Aug 10.
- `from` only → `lastContactDate >= from`. `to` only → `lastContactDate <= to`. Both → inclusive between.

### 7.3 Search vs. Email/Phone filters
- Global search (toolbar) is a broad **OR** across name/email/company, case-insensitive substring, trimmed.
- The dedicated Email and Phone filters (inside the drawer) are exact-field substring filters.
- Global search and the dedicated Email/Phone filters combine with **AND**. Worked example:
  ```
  Search = "acme"
  Email filter = "@gmail"

  → (name OR email OR company contains "acme")
    AND
    (email contains "@gmail")
  ```

### 7.4 URL as source of truth

For every URL-backed state type (committed filters, search, sort, pagination), the **URL search params are the single source of truth**. Local/component state may temporarily mirror a value for smooth UI (e.g. an input showing keystrokes before the debounce fires), but the actual committed value used to build a query key must always be read from — or immediately written to — the URL. Do not let a separate piece of long-lived React state silently diverge from the URL; that is the specific bug this rule prevents.

### 7.5 Predefined Saved View Payloads

See Phase 5 for the full table. Restated here as the canonical definition since saved views are, architecturally, just named filter payloads:

- **All Customers** → `{}`
- **Active Customers** → `{ status: ['active'] }`
- **Recent Contacts** → `{ lastContactFrom: today - 7 calendarDays, lastContactTo: today }`, inclusive, recomputed against "today" at the moment the view is selected (not a fixed stored date)
- **Needs Attention** → `{ status: ['active'], risk: ['high'] }`
- **Inactive Customers** → `{ status: ['inactive'] }`

### 7.6 Pagination Reset Rule (binding)

Pagination resets to **page 1** whenever any of the following change: the committed search term, any committed filter (via Apply, chip removal, Clear All, or selecting a saved view), or the page size. Pagination does **not** reset when only the sort column/direction changes.

### 7.7 State persistence model

| State | Persistence |
|---|---|
| Committed filters | URL search params (survives refresh) |
| Draft filter changes (inside open drawer, pre-Apply) | Local component state only |
| Search term | URL search params |
| Sort | URL search params |
| Pagination (page, pageSize) | URL search params |
| Saved view selection highlight | Derived, not stored (§Phase 5) |
| Custom saved views + their order | In-memory (React state), survives navigation between routes in the running app; reset on a full page reload — this is expected, not a bug |
| Dark/light mode (if built) | Local state or `localStorage`, per Phase 10 implementer choice — not required to sync with URL |

No state type is allowed to invent a different persistence mechanism than the one listed here.

---

## 8. Reusable Component Contracts (build to these signatures)

```tsx
<CustomerForm mode="create" onSuccess={...} />
<CustomerForm mode="edit" defaultValues={customer} onSuccess={...} />

<ConfirmDialog
  open={boolean}
  title={string}
  description={string}
  confirmLabel={string}
  destructive?={boolean}
  onConfirm={() => void}
  onOpenChange={(open: boolean) => void}
/>

<FilterChip label={string} onRemove={() => void} />

<DataTablePagination
  page={number}
  pageSize={10 | 25 | 50}
  total={number}
  onPageChange={(page: number) => void}
  onPageSizeChange={(size: number) => void}
/>

<StatusBadge status={'active' | 'inactive'} />

<FollowUpRiskBadge risk={'low' | 'medium' | 'high'} />
// risk is ALWAYS the caller-computed output of getFollowUpRisk(customer.lastContactDate).
// Customer never has a `.risk` property — passing anything other than a freshly
// derived RiskLevel into this component is a contract violation.

<LoadingState variant={'table' | 'card' | 'detail'} />
```

Any new component added later must declare a similarly explicit prop contract in the Phase report before being wired in.

---

## 9. UX Decisions Log (previously ambiguous, now settled)

1. **Filter drawer interaction:** Apply-based, not real-time (§Phase 4).
2. **Saved-view selection identity:** exact committed-filter match only; any manual change clears the highlight (§Phase 5).
3. **Custom view naming:** required, trimmed, 1–40 chars, duplicates rejected, empty-filter saves allowed (§Phase 5).
4. **Update Last Contact UI:** date picker + explicit "Update" button; no inline-text alternative; future dates blocked at input (§Phase 6).
5. **Notes/Interactions:** read-only for this assignment (§Phase 6, §5).
6. **Delete-while-drawer-open:** drawer closes and selection clears on successful delete (§Phase 7).
7. **CSV columns:** `Name, Email, Phone, Company, Status, Last Contact, Follow-up Risk`, risk derived at export time (§Phase 10).
8. **Routing:** `/` = Dashboard, `/customers` = workspace — decided in Phase 1, never revisited (§Phase 1, §Phase 9).
9. **"Mock API" terminology:** means the async client-side service layer in `lib/api/customers.ts`. Do **not** create Next.js Route Handlers or any `/api/*` path — there is no HTTP boundary in this app (§3, §Phase 2).
10. **Recent Contacts:** last contact within the last 7 calendar days, inclusive, recomputed against "today" at selection time (§7.5).
11. **Every predefined saved view has an explicit filter payload** — see §7.5 — so "saved views are just filters" is fully deterministic, not left to interpretation.
12. **Phase 6 vs. Phase 9:** Update Last Contact's cache invalidation (including `customerKeys.stats()`) is wired in Phase 6; the *visible* Dashboard KPI check happens in Phase 9, once the Dashboard UI exists (§Phase 6, §Phase 9).
13. **`getCustomerStats().needsAttention`** must call `isNeedsAttention()` — never a separately reimplemented status/risk check (§Phase 2, §5.2 area, §6).
14. **Pagination reset:** any committed search/filter/page-size change resets to page 1; sort changes do not (§7.6).
15. **Follow-up Risk sort order:** `low < medium < high`, by rank, never alphabetical; date sorting always compares actual calendar dates, never display strings (§Phase 3).
16. **Mock error injection:** a deterministic `setMockApiErrorMode('off' | 'next' | 'all')` toggle — no random failures during normal use (§5.2).
17. **Debounced search and the URL:** only the debounced value is ever committed to the URL; raw keystrokes stay local (§Phase 3, §7.4).
18. **URL is the source of truth** for all URL-backed state (§7.4).
19. **Calendar-date comparison** (not raw timestamp) is used everywhere a date is checked against "today," including Zod validation (§5.3).
20. **Test runner:** Vitest, required, not optional (§Phase 13).
21. **Last Contact date picker default:** today's date, not the customer's existing value (§Phase 6).

---

## 10. Manual Regression Script (used in Phase 13, keep updated as you build)

1. Search "acme" → only Acme-related rows return, debounce confirmed (network tab), case-insensitivity confirmed (try "ACME").
2. Sort by Last Contact asc/desc → order correct. Sort by Follow-up Risk asc/desc → order correct.
3. Change page size 10 → 25 → 50 → counts and rows correct.
4. Apply Status=Active + Company=Acme + Risk=High together (via Apply) → correct intersection; verify draft-vs-committed by closing the drawer without Apply first and confirming nothing changed.
5. Remove one chip → filter set updates correctly (direct commit, no Apply needed), others remain.
6. Clear All → full list returns immediately.
7. Date range From=Aug1/To=Aug10 → both boundary dates included.
8. Search "acme" + Email filter "@gmail" together → AND behavior per §7.3.
9. Select Needs Attention view → matches Active+High manually applied; highlight is on. Manually change one filter → highlight clears.
10. Save a custom filter combo with a valid name → appears in Saved Views, reselecting reapplies it correctly. Try a duplicate name → rejected. Try an empty name → rejected.
11. Drag-reorder saved views (mouse and keyboard) → order persists during session.
12. Open a High-risk customer → Update Last Contact via date picker (confirm future dates are blocked) → risk becomes Low in drawer, table, and Dashboard → customer disappears from Needs Attention without refresh.
13. Add a new customer with valid data → appears in list, Dashboard Total increments, toast confirms.
14. Add a customer with invalid email or a future last-contact date → inline error, submit blocked.
15. Edit an existing customer → same form component, pre-filled, saves correctly.
16. Delete a customer that is currently open in the drawer → drawer closes, selection clears, list and Dashboard update, toast shown.
17. Force the mock service's error path once → error state + Retry works on list, detail, and stats queries.
18. Export CSV while filters are active → file contains only the filtered subset, correct 7 columns, risk matches what's shown on screen.
19. ⌘K → opens palette, navigation and action entries work.
20. Toggle dark/light → whole app switches, no flash of unstyled content.
21. Resize to 375px → sidebar collapses, filters go full-width drawer, details go full-screen, nothing inaccessible.
22. Tab through the entire app with keyboard only, including dnd reorder and dialogs — nothing is a dead end.

---

## 11. Definition of Done (final audit gate — Phase 13)

**P0**
- [ ] Follow-up Risk correct per calendar-day semantics, including boundary cases and future-date clamping
- [ ] Needs Attention view works as a real filter combination, with correct selection-identity behavior
- [ ] Advanced Filters: all 6 types, OR-within/AND-across, inclusive date range, search+field-filter AND combination
- [ ] Customer table: search, sort, pagination (10/25/50), responsive
- [ ] Update Last Contact → risk recalculates → Needs Attention membership and Dashboard stats update live, no refresh
- [ ] TanStack Query: caching, loading, error, invalidation per the documented policy (§Phase 8)

**P1**
- [ ] Full CRUD: add, edit (shared `CustomerForm`), delete (with `ConfirmDialog` and delete-while-open handling)
- [ ] Saved views: predefined + custom (validated naming), drag-to-reorder (mouse + keyboard)
- [ ] Dashboard KPIs sourced from `getCustomerStats()`, not a paginated slice
- [ ] Responsive at all required breakpoints; keyboard accessible; WCAG AA contrast
- [ ] Loading/empty/error states everywhere data is shown

**P2**
- [ ] CSV export (filtered set, correct columns, risk derived at export time) — if built
- [ ] Command palette — if built
- [ ] Dark/light mode — if built
- [ ] Bulk actions — if built

**Reusability**
- [ ] Reusable form field primitives, one `CustomerForm` for create+edit
- [ ] Reusable `StatusBadge`, `SearchInput`, `FilterChip`, `ConfirmDialog`, `LoadingState`/`ErrorState`/`EmptyState`
- [ ] Shared Zod validation schema (including not-in-future date rule)
- [ ] `customer-rules.ts` / `lib/api/customers.ts` / `query-keys.ts` fully separate business logic from UI

**Submission**
- [ ] Unit tests for business rules passing
- [ ] Meaningful commit history, README complete
- [ ] Production build succeeds, zero TS/lint errors, no console errors
- [ ] Vercel deployment live and verified

---

## 12. Git Commit Convention

One meaningful commit per completed sub-feature within a phase. Format: `type: short description`.
Allowed types: `chore`, `feat`, `fix`, `refactor`, `test`, `docs`.

Good:
```
feat: add follow-up risk calculation with calendar-day semantics
feat: implement advanced customer filters drawer with Apply model
fix: correct pagination reset on new search term
test: add unit tests for getFollowUpRisk boundary cases
```

Never: `final`, `final2`, `update`, `wip`, `done`, `changes`.

---

## 13. Explicitly Out of Scope (do not build even if convenient)

- Authentication / login
- Real database or backend, or any Next.js Route Handler / `/api/*` path (§9.9)
- Email/WhatsApp/notification integrations
- AI/ML anything (Follow-up Risk is a rule, say so everywhere it's mentioned)
- Real-time WebSockets
- Sales pipeline / marketing automation modules
- Elaborate animations/glassmorphism/gradients
- Drag-and-drop for anything other than saved-view reordering
- Creating, editing, or deleting individual Notes/Interactions (read-only, §9.5)
- `dealValue` / `accountOwner` fields or UI

---

## 14. Final Instruction to the Agent (Antigravity)

Build exactly one Phase at a time, in order, from §4. After each Phase: stop, output the Phase Completion Report from §0.2, and wait for `approved, continue`, `fix: ...`, or `skip <phase>` before proceeding. Protect P0 (§1) above all else if time is short. Do not restructure the repo tree in §3 without flagging the addition in that Phase's report. Do not introduce logic outside the locations defined in §6. Every UX ambiguity that existed in v1 of this PRD has been resolved in §9 — if you find yourself inventing a new product decision that isn't covered there, stop and flag it in the Completion Report rather than deciding silently.