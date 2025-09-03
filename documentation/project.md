# Functional requirements

## Users & auth
- Email/password signup & login (JWT), optional Google OAuth.
- Single “personal” workspace to start; multi-profile later (e.g., Personal, Family, Business).
- Timezone (IST default) and currency (INR default) per workspace; user can change.

## Accounts & categories

- Create/read/update/archive accounts (Bank, Credit Card, Wallet, Cash, UPI, Investments).
- Create/read/update/archive categories (nested: e.g., Food → Eating Out).
- Category types: Expense, Income, Transfer, Investment, Savings.
- Budgets can attach to categories or category groups.

## Transactions

- CRUD transactions with: date/time, account, category, amount, currency, notes, tags, attachments (receipt image/pdf).
- Types: Expense, Income, Transfer (account→account), Split (one txn → multiple categories).
- Recurring rules: daily/weekly/monthly/custom CRON-ish; auto-post on schedule.
- Import CSV/Excel (mappable columns); detect duplicates by (date±1d, amount, memo hash).
- Quick-add from global shortcut (e.g., “-250 lunch @HDFC #food”).

## Budgets

- Monthly and custom period budgets per category or group.
- Rollover settings (carry over leftover/overspend).
- Alerts when projected to exceed budget or drop below savings target.

## Dashboards & reports (Angular)
- Overview: Net worth, total expenses, top categories, upcoming recurring txns.
- Trends: Expenses/Income over time (line), category breakdown (pie/donut), accounts balance (bar).
- Cashflow calendar: day/week/month view with totals and upcoming recurrences.
- Search & filters: by date range, account, category, tag, amount range, text.
- Export: CSV/XLSX for transactions; PNG/PDF for charts.

## “What-if” projections (the twist)

- Scenario builder:
  - Define levers: reduce category spend by X%, cancel/shift a recurring txn, increase income by X, add savings rule.
  - Set time horizon (3, 6, 12 months).
- Output:
  - Projected spend vs current baseline.
  - Projected budget compliance by month.
  - Impact on net cash and goal timelines (e.g., “emergency fund hits ₹1.5L in 5.2 months vs 7.8 months”).
  - Compare multiple scenarios side-by-side; save scenario snapshots.

## Goals

- Create goals (Emergency fund, Vacation, Down payment) with target amount & date.
- Allocate monthly contributions; show ETA based on historic cashflow and scenarios.

## Notifications

- Email/Push (optional) for: budget threshold crossed, large transactions, failed imports, upcoming recurrences.
- In-app toasts and a notifications center.

## Admin & settings

- Profile, currency, timezone, first day of week, number/currency display format.
- Data export/backup (JSON bundle), delete account (hard delete with 7-day grace).

# Non-functional requirements

## Performance
- P95 API latency ≤ 200ms for CRUD; ≤ 800ms for analytics endpoints (with pagination/windowing).
- Support 10k+ transactions per user without noticeable UI lag; virtualized lists in Angular.
- Indexed queries: date, category, account, amount, text (Mongo text index or Postgres trigram).

## Security & privacy

- JWT access + refresh tokens; HTTP-only refresh cookie.
- Role: owner (you); later: viewer/editor for family mode.
- Rate limiting (IP+user), brute-force protection, CORS locked to app origin.
- Encrypt secrets at rest; do not store OAuth tokens for banks in v1.
- Attachments virus-scan stub (queue for later), size limit (e.g., 5 MB/file).
- GDPR-style: export and delete data; minimal PII.

## Reliability & data integrity

- Idempotent imports & webhooks (hash key).
- Soft-delete + audit fields (created_at, updated_at, deleted_at, created_by).
- Daily automated backups; restore from last 7 days.
- Transactional guarantees:
  - Postgres: use transactions for transfers (two rows + linking table).
  - Mongo: use two-phase pattern or single-doc atomic updates where possible.

## Scalability & architecture

- Nest.js modular structure: auth, users, accounts, categories, transactions, budgets, goals, reports, scenarios, files.
- Use CQRS pattern for reports/projections; keep write model simple, read model optimized.
- Background jobs (BullMQ/Redis) for recurring postings, imports, projections pre-compute.

## Observability

- Structured logs (request id, user id, route, duration).
- Metrics: request rate/latency, job queue depth, DB query time, projection cache hits.
- Error tracking (Sentry compatible) with source maps for Angular.

## UX & accessibility

- Keyboard-first flows (quick add, search, filters).
- Accessible charts (ARIA labels, text summaries).
- Mobile-friendly layout; offline-friendly read views (later PWA).

## Internationalization

- Currency formatting via ICU; support multiple currencies per txn (store amount + fx_rate + base_amount_INR).
- Date/time localized to user timezone.

## Compliance & legal

- Show clear disclaimer: personal tool, not tax advice.
- Data retention policy configurable (e.g., keep attachments 24 months).


# Suggested data model (brief)

### accounts

- id, name, type, currency, balance_cached, archived, timestamps

### categories

- id, name, parent_id, type (expense/income/transfer/investment), archived, timestamps

### transactions

- id, date_time, account_id, type, amount, currency, base_amount_inr, category_id (nullable for split), notes, tags[], attachment_ids[], is_split, split_items[] {category_id, amount}, transfer_link_id, timestamps

### budgets

- id, period (month/custom), start_date, end_date, scope (category/group), amount, rollover_type, timestamps

### recurrences

- id, rule (rrule string), template_transaction_id, next_run_at, status

### goals

- id, name, target_amount, target_date, allocated_category_ids[], monthly_contribution, status

### scenarios

- id, name, horizon_months, levers[] (type, target ids, delta %/amount, start/end), baseline_hash, results_cache

## Core API surface (REST; GraphQL also fine)

```
POST /auth/register | /auth/login | /auth/refresh
GET /me
/accounts CRUD
/categories CRUD
/transactions CRUD + bulk import (POST /transactions/import) + search (GET /transactions?from=&to=&...)
/budgets CRUD + GET /budgets/:id/summary?month=
/recurrences CRUD + POST /recurrences/:id/run
/reports/overview?from=&to=
/reports/cashflow?granularity=month
/reports/category-breakdown?from=&to=
/scenarios CRUD + POST /scenarios/:id/run
/files upload/download (signed URLs)
```

## Angular feature map

- Shell: top nav (Accounts, Transactions, Budgets, Reports, Scenarios, Goals), global search, quick-add modal.
- Transactions page: infinite list, smart filters, editable rows, split editor drawer.
- Budgets page: monthly grid with traffic-light indicators and drill-downs.
- Reports page: Overview cards + charts (line/pie/bar).
- Scenarios page: lever form, comparison chart, saved scenario list.
- Goals page: progress bars with ETA from baseline and from chosen scenario.

## MVP vs v2

### MVP

- Local auth, accounts/categories/transactions CRUD, CSV import, budgets (monthly), basic overview & category breakdown charts, recurring txns, one scenario type (category reduce %), data export.

## V2

- Multiple scenarios & comparisons, goals with ETA, cashflow calendar, mobile PWA, attachment uploads, family workspace, webhook integrations (e.g., Razorpay payout CSV import, bank CSV templates), prediction helpers (auto-categorization using simple rules/ML later).

## Acceptance criteria (samples)

- Creating an expense reduces the selected account balance immediately; creating a transfer decreases source and increases destination atomically.
- A monthly Food budget of ₹10,000 turns amber at ≥80% and red at ≥100%; rollover adds prior leftover to the new month if enabled.
- Importing the same CSV twice results in zero duplicates (hash strategy works).
- Running a scenario “Food −20% for 6 months” shows the projected savings delta and updates the goal ETA card without modifying real data.

## Edge cases to handle

- Timezone boundaries: transactions near midnight should show correctly in IST across lists and charts.
- Negative amounts in CSV (normalize to type).
- Split transactions where split sum ≠ total (block save).
- Deleted categories that are referenced (mark transaction as uncategorized until remapped).
- Currency conversion when mixing INR and others (store both original and base INR).

## Tech pointers

- Nest: modules per domain, Prisma (Postgres) or Mongoose (Mongo). For analytics, Postgres + materialized views can speed charts; Mongo needs careful aggregation + pre-compute.
- Caching: per-user monthly aggregates (budgets, breakdowns) in Redis keyed by user:month.
- Charts: Angular + ngx-charts or Chart.js; keep raw data endpoints simple and let the client render.

next step is to pick DB (Postgres is friendlier for reports), lay scaffolding (Nest modules + Angular routes), and define the CSV import schema so you don’t paint yourself into a corner later.