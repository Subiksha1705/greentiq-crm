# GreenTiq CRM — Advanced Customer Workspace

A high-performance Customer Relationship Management (CRM) dashboard and workspace built for the Greentiq Innovations front-end assessment. Built on Next.js 16 App Router and TypeScript, featuring full customer & company management, multi-criteria filtering, drag-and-drop saved views, full-dataset Excel/CSV import & export, a rule-based Follow-up Risk Engine, and a simulated in-memory backend with realistic network latency and error injection.

**Live Demo:** [https://greentiq-crm-nine.vercel.app](https://greentiq-crm-nine.vercel.app)  
**Source Code:** [https://github.com/Subiksha1705/greentiq-crm](https://github.com/Subiksha1705/greentiq-crm)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript (Strict mode) |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide Icons |
| **State & Data Caching** | TanStack Query v5 (React Query) |
| **Drag & Drop** | @dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) |
| **Forms & Validation** | React Hook Form + Zod resolvers |
| **File I/O** | `xlsx` (Excel `.xlsx` and Comma-Separated `.csv` export/import) |
| **Testing** | Vitest + Testing Library (**30/30 tests passing**) |
| **Theming** | `next-themes` (instantaneous, synchronized dark/light mode) |

---

## Quick Start

```bash
# 1. Install dependencies (legacy-peer-deps handles React 19 / react-day-picker metadata)
npm install --legacy-peer-deps

# 2. Start local development server
npm run dev

# 3. Run automated tests, linter, and production build
npm test             # Run Vitest test suite (30 tests)
npm run lint         # Check ESLint rules (0 errors/warnings)
npm run build        # Validate TypeScript and produce production build
```

---

## Feature Tour (From Core to Advanced)

### 1. Executive Dashboard & Risk Intelligence
- **Weighted Portfolio Health Metric**: Client-side composite index giving full credit to Low Risk (100%), half to Medium Risk (50%), and zero to High Risk (0%), distinct from single-tier counts.
- **Session Trend Deltas**: `sessionStorage`-backed snapshot tracking delta comparisons (`↑`, `↓`, `0`, or `New session`) on *Needs Attention*, *At-Risk Ratio*, and *Avg Recency* with inverted alert color semantics.
- **Interactive Visual Charts**:
  - **Follow-up Risk Donut Chart**: Visual tier distribution with click-to-filter routing to corresponding customer segments.
  - **Recency Velocity Bar Chart**: Distribution of calendar days elapsed since last touchpoint.
- **Top Client Organizations**: Realistic, weighted account volume ranking with active vs. total contact ratios.
- **Collapsible Risk Intelligence Engine**: Expandable operational guide explaining rule-based tier boundaries (0–7d Low, 8–30d Medium, 31+d High) with rotating chevron animation.

### 2. Customer Directory & Responsive Table
- **Search with Smart Shortcuts**: Debounced live search across Name, Email, and Company with loading indicators, instant clear button, and `Esc` keyboard shortcut.
- **Phone Number Normalization**: Normalized digits-only matching for international and formatted phone numbers (`+1`, spaces, dashes, parentheses).
- **Column Sorting**: Interactive ascending/descending sorting on Name, Email, and Last Contact Date.
- **Mobile-Adaptive Pagination**: Responsive flex-wrapping pagination controls preventing UI overflow on small screens with selectable page sizes (10 / 25 / 50).
- **Isolated Horizontal Scrolling**: Custom table container (`overflow-x-auto min-w-[850px]`) preserving outer viewport stability on mobile devices.

### 3. Advanced Filtering & Drag-and-Drop Saved Views
- **Multi-Criteria Filter Side-Sheet**:
  - Multi-select **Company** (sourced across the full dataset).
  - Multi-select **Status** (Active / Inactive lifecycle states).
  - **Date Range Picker** for last contact intervals.
  - Substring matching for **Phone** and **Email**.
- **Saved Views with Drag-and-Drop**: Save custom named filter configurations, activate with one click, and reorder via **dnd-kit** (`DndContext` + `useSortable`).
- **SSR Hydration-Safe DnD**: Synchronized mount initialization preventing SSR vs. client accessibility ID mismatches.
- **Touch-Friendly Controls**: Reorder handles and delete buttons always accessible on mobile/touch viewports.
- **Active Filter Count Badge**: Real-time counter badge on toolbar indicating active filter count with instant "Clear All".

### 4. Customer Details & Inline Operations
- **Interactive Details Drawer**: Deep customer view showing profile info, risk badge, last contact calculation, and activity history.
- **Inline Profile Editing**: Edit contact details in-place without page navigation.
- **Inline Interaction Logging**: Add new calls, emails, meetings, and notes directly from the activity timeline with instant cache invalidation.
- **Status Toggle**: One-click active/inactive relationship toggle from the profile header.
- **Zod-Validated Modal Forms**: Type-safe create/edit forms with real-time field validation, custom `PhoneInput` with country code selector, and confirmation delete dialogs.

### 5. Bulk Operations & Full-Dataset Import/Export
- **Multi-Select Bulk Actions Bar**: Floating batch action bar for bulk status updates and bulk deletion.
- **Export Filtered Data to Excel & CSV**: Exports the **entire unpaginated result set matching current filters**, not just the visible page.
- **Bulk Import with Drag-and-Drop**: Upload `.csv` or `.xlsx` files with downloadable sample templates, client-side header validation, preview table, and batch ingestion.

### 6. Company Accounts & Workspace Parity
- **Full CRUD for Companies**: Register, view, edit, and delete corporate client accounts.
- **View Mode Switching**: Toggle seamlessly between **Table View** and **Grouped Cards View**.
- **Sortable Columns**: Interactive sort headers on Company Name, Industry, Tier, Total Contacts, and Active Contacts.
- **Company Import & Export Modals**: Parity with customer import/export supporting spreadsheet templates, drag-and-drop, and Excel/CSV formats.
- **Linked Contacts Drill-down**: One-click drill-down linking corporate accounts to their customer contact records.

### 7. Design System, Theming & Accessibility
- **Synchronized Theme Switching**: Dark and light mode switching via CSS variable design tokens with `disableTransitionOnChange` for instant, lag-free transitions.
- **Command Palette (⌘K / Ctrl+K)**: Quick launcher for navigation, filter presets, and action shortcuts.
- **Accessibility & Feedback**: High-contrast risk badges, ARIA labels on drag handles, keyboard navigation, and Sonner toast notifications for all async operations.

---

## Code Quality & Key Bug Fixes

- **Full-Dataset Company Options**: Resolved issue where company filter dropdown only reflected the active paginated page by introducing `getCustomerFilterOptions()`.
- **Full-Dataset Filtered Export**: Resolved issue where exports were constrained to the current page by introducing `listAllFilteredCustomers()` to export the complete filtered query.
- **Deduplicated Query Cache**: Centralized query keys (`src/lib/query-keys.ts`) preventing stale cache collisions.
- **Test Coverage**: 30 Vitest tests validating customer filtering rules, validation schemas, company operations, and debounced hooks.
- **Linter & Types**: 0 ESLint errors/warnings and strict TypeScript compilation (`npx tsc --noEmit`).

---

## Directory Structure

```text
src/
├── app/                  # Next.js App Router pages (Dashboard, Customers, Companies)
├── components/
│   ├── common/           # Reusable UI (SearchInput, StatusBadge, DataTablePagination, ConfirmDialog)
│   ├── customers/        # Customer table, filters, drawer, saved views, import/export modals
│   ├── companies/        # Company table, cards view, details, import/export modals
│   ├── dashboard/        # KPI cards, TrendDelta, DonutChart, BarChart, RiskGuide
│   ├── layout/           # AppShell, Sidebar, Topbar, ThemeToggle
│   └── ui/               # shadcn/ui Radix primitives
├── hooks/                # TanStack Query custom hooks & filters state
├── lib/
│   ├── api/              # Mock API layer with latency simulation & error injection
│   ├── customer-rules.ts # Centralized filtering, sorting, and follow-up risk engine
│   ├── export-import.ts  # Excel & CSV file generation and parsing
│   └── validations/      # Zod validation schemas
├── data/                 # Deterministic mock customer & company seed stores
└── types/                # TypeScript interface definitions
```