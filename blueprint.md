# Expense Tracker / Personal Finance App Blueprint

## Product goal

Build a secure, multi-user personal finance application that teaches practical full-stack patterns: authentication, data modeling, authorization, validated forms, uploads, background work, pagination, search, exports, and clear separation of reusable UI and business logic.

Each user's financial data is private by default. Every server operation that reads or changes user-owned data must scope access to the authenticated user (or an explicitly authorized administrator).

## Chosen baseline

- **Web:** Next.js App Router, React, and TypeScript, organized under `src/`.
- **Styling:** CSS modules/global CSS with shared design tokens; add a utility CSS framework only if it improves delivery.
- **Database:** PostgreSQL with Prisma ORM and committed schema migrations.
- **Authentication:** Better Auth with database-backed sessions and built-in email/password reset flow.
- **Validation:** Zod schemas shared between form feedback and server parsing.
- **Charts:** Recharts.
- **Receipt storage:** Private object storage in production behind a small storage adapter.
- **Background work and email:** A provider/scheduler adapter with idempotent jobs; select concrete providers when those stages are implemented.

Keep UI, domain rules, persistence, and external services behind clear boundaries so alternatives can be swapped without rewriting feature logic. See `README.md` for local setup and environment configuration.

## Core design rules

1. **Model ownership explicitly.** User-owned records include an `ownerId` (or belong through a parent that has one); enforce ownership in server-side queries and mutations, not just in the UI.
2. **Keep money exact.** Store amounts as integer minor units (for example, cents) plus an ISO currency code. Avoid floating-point arithmetic for financial values. Define whether transactions are represented as signed amounts or as amount plus type, and use that convention consistently.
3. **Store instants and calendar dates deliberately.** Use timestamps for audit fields and a documented timezone/calendar-date policy for due dates, recurrence, and reporting ranges.
4. **Validate at both boundaries.** Client validation improves feedback; server validation is authoritative. Share schemas where practical, and still enforce authorization and business rules on the server.
5. **Make common behavior reusable.** Use shared form fields, table/list primitives, pagination and filter controls, money/date formatters, validation schemas, and domain services. Reuse stable behavior, not abstractions with only one use or excessive configuration.
6. **Keep database access out of presentation code.** Route handlers/server actions call feature services; services apply domain rules and use repositories or focused data-access functions. Avoid a generic repository framework unless real duplication justifies it.
7. **Use migrations and constraints.** Document schema changes as migrations. Use database constraints and indexes for invariants and common query paths, not only application checks.
8. **Make consequential writes traceable.** Add created/updated timestamps, useful error handling, and audit fields where appropriate. Never log passwords, session secrets, or receipt contents.

## Main user flows

- Create an account, sign in/out, verify or reset a password by email.
- Create and manage accounts (cash, checking, credit card, etc.) and categories.
- Record, edit, search, filter, paginate, and delete transactions.
- Attach and view a receipt image for a transaction.
- Define recurring transaction rules and review the transactions they generate.
- Review income, expenses, balances, and trends on a date-range dashboard.
- Export the currently selected transaction results as CSV.
- Optionally manage users through a narrowly scoped administrator view.

## Suggested data model

Use migrations to evolve these entities. Names are illustrative; settle the final schema and relationship rules before building feature pages.

- **User:** id, email (normalized and unique), password/auth provider fields, role, status, createdAt, updatedAt.
- **Account:** id, ownerId, name, type, currency, opening balance or balance strategy, archivedAt, timestamps.
- **Category:** id, ownerId (nullable only for intentional built-in categories), name, transaction type applicability, archivedAt, timestamps.
- **Transaction:** id, ownerId, accountId, categoryId, amountMinor, currency, type, occurredAt, description/payee, optional recurrence instance reference, timestamps.
- **RecurringRule:** id, ownerId, accountId, categoryId, amountMinor, currency, type, cadence/interval, start date, next run date, optional end date, timezone/policy, active state, timestamps.
- **Receipt:** id, ownerId, transactionId, storage key, safe display metadata (content type, byte size), createdAt. Do not make a public storage URL the source of authorization.
- **PasswordResetToken:** userId, hashed token, expiry, usedAt; store only a hash and make tokens single-use.
- **Email/outbox job (if needed):** message type, recipient/user reference, payload reference, status, attempts, scheduledAt, sentAt. Avoid storing sensitive financial details unnecessarily.

Important constraints and indexes:

- Unique normalized user email; foreign keys for all relationships.
- Ownership-aware references: a transaction cannot connect one user's account/category to another user's record. Enforce with scoped server checks and, where practical, database constraints.
- Index transactions by `(ownerId, occurredAt)` and common filter dimensions such as account/category; tune after observing queries.
- Index due recurring rules by `(active, nextRunAt)` and ensure generated occurrences are idempotent (for example, a unique rule/occurrence-date key).
- Define archive/delete behavior explicitly. Prefer archiving accounts/categories referenced by history; use explicit, safe account deletion rules.

## Staged implementation plan

Complete a stage's exit criteria before adding the next stage. Keep each stage small enough to review and run locally.

### Stage 0 — Repository and product foundation

- Choose and document framework, database, ORM, authentication, validation, charting, storage, and job/email approach.
- Establish a clear feature-oriented layout, environment-variable example file, formatting/lint conventions, and local setup instructions.
- Document the database connection and migration workflow; the initial schema and migration are introduced with the data foundation in Stage 1. Never commit secrets.
- Sketch the primary navigation and define shared design tokens (spacing, color, typography) before duplicating page styles.

**Exit:** A new developer can install dependencies, configure local environment, and run the app using the README; framework and tooling choices are recorded and ready for the database/auth foundation in Stage 1.

### Stage 1 — Data foundation and authentication

- Create User and authentication/session schema using Better Auth and Prisma; implement sign-up, sign-in, sign-out, and protected routes.
- Add a server-side current-user helper and a consistent authorization failure path.
- Add password reset by email with expiring, single-use hashed tokens and non-enumerating responses (do not reveal whether an email exists).
- Define reusable form, field-error, button, loading, and empty-state primitives.

**Exit:** Unauthenticated users cannot reach private pages or APIs; users can reset credentials safely; session secrets never reach client code.

### Stage 2 — Accounts and categories

- Implement owner-scoped account and category create/list/update/archive flows.
- Enforce field constraints and ownership in server code; handle duplicate names according to a documented policy.
- Build reusable settings forms and account/category selectors.
- Add initial built-in categories only if their ownership and customization behavior are clear.

**Exit:** One user cannot read, update, or reference another user's accounts or categories, including by guessing IDs.

### Stage 3 — Transactions and validated forms

- Implement transaction create/edit/detail/delete (or archive) with account, category, amount, type, date, description, and currency rules.
- Define account balance calculation policy. Prefer deriving balances from opening balances and transactions initially; introduce cached balances only with a reconciliation strategy.
- Use shared schemas for client feedback and server parsing; server checks confirm ownership, valid currency, amount bounds, and compatible account/category.
- Build reusable transaction form and money/date formatting helpers.

**Exit:** Invalid and cross-user writes are rejected on the server; transaction changes yield consistent account balances.

### Stage 4 — Search, filters, pagination, and CSV

- Add server-side search and composable filters for date range, account, category, transaction type, and amount as useful.
- Use stable, deterministic pagination (cursor pagination is preferred for large/changing datasets; offset pagination is acceptable initially with a stated limit). Keep filter and page state in URL query parameters so views are shareable and refresh-safe.
- Apply identical authorization and filter rules to list and export queries. Stream or chunk large CSV exports; escape values safely to prevent spreadsheet formula injection.
- Create reusable filter bar, sortable table/list, pagination controls, and CSV formatting utilities.

**Exit:** Search, filters, page navigation, and CSV export return only the current user's matching records; empty and invalid ranges are handled clearly.

### Stage 5 — Dashboard and charts (implemented)

- [x] Add a date-range dashboard with totals for income/expenses, account balances, spending by category, and a time series.
- [x] Compute chart data on the server from the same date/currency conventions as transaction reporting; avoid loading all transactions into the browser.
- [x] Use responsive, server-rendered SVG charts with accessible labels/legends, data tables, and useful no-data states.
- [x] Reuse summary cards and date-range controls. Group currencies separately; do not sum unlike currencies without an exchange-rate policy.

**Exit:** Dashboard totals agree with filtered transaction data for the selected range and the user's own records. Date ranges use inclusive UTC calendar dates and are limited to 366 days; trends are daily through 62 days and monthly beyond that. The initial range covers the previous 366 calendar days.

### Stage 6 — Receipt uploads

- Add receipt upload and removal for a transaction, with server-side ownership checks for both transaction and file.
- Restrict file size and allowed image types, inspect file signatures where supported, generate opaque storage keys, and avoid trusting the original filename or client MIME type.
- Store files privately. Serve them through an authorized handler or short-lived signed URLs after ownership checks. Clean up orphaned objects on failed writes/deletes.
- Keep storage operations behind a small adapter so local development and production storage share the same feature API.

**Exit:** A user can upload and view only their own valid receipts; oversized, invalid, or unauthorized uploads are rejected.

### Stage 7 — Recurring transactions and background processing

- Let users create, edit, pause, and stop recurring rules with a supported cadence and clear timezone/date policy.
- Generate due transaction instances in a scheduled job, using a database transaction and idempotency key so retries cannot create duplicates.
- Define behavior when a rule is edited, paused, missed, or reaches its end date. Record the generated occurrence date for traceability.
- Keep scheduler/job code independent from request handlers and make failures observable and retryable.

**Exit:** Re-running a due job does not duplicate transactions; recurrence behavior is predictable around date boundaries and retries.

### Stage 8 — Email and optional roles/admin

- Send password reset email through an email adapter; optionally add a monthly summary with user preferences, opt-out, timezone, and delivery deduplication.
- Add an `admin` role only if the product needs an admin view. Centralize role checks in server authorization helpers and grant least privilege; admin screens should expose only necessary data and actions.
- Do not allow client-provided role values or email preferences to bypass server policy.

**Exit:** Email jobs are safe to retry and do not disclose data to the wrong recipient; admin-only operations are enforced on the server.

### Stage 9 — Hardening and release readiness

- Review authorization coverage for every read, write, export, upload, and background job.
- Add appropriate rate limits for login, reset requests, and uploads; safe error messages; security headers; and production secret/storage configuration.
- Review accessibility, responsive behavior, loading/error/empty states, query performance, and database indexes.
- Document backup/restore, migrations, deployment environment variables, and operational job/email monitoring.

**Exit:** A release checklist is complete, production configuration is documented, and the application has been reviewed against the security and data-ownership rules above.

## Reusable application structure

Adapt names to the chosen framework, but keep features discoverable and responsibilities clear:

```text
src/
  app-or-routes/       # Route composition; keep business rules out of page components
  features/
    auth/
    accounts/
    categories/
    transactions/
    dashboard/
    recurring/
    receipts/
  components/
    ui/                 # Small shared primitives
    forms/              # Reusable field/error patterns
  server/
    auth/               # Session and authorization helpers
    db/                 # Database client and migrations support
    email/              # Email adapter
    storage/            # Receipt storage adapter
    jobs/               # Scheduled/background work
  lib/
    validation/         # Shared schemas
    money/              # Exact arithmetic and formatters
    dates/              # Date range and timezone helpers
```

Within a feature, keep related schema, service, data access, and UI together when that improves discoverability. Avoid making every small function a separate layer. Extract a shared component or helper when it has a stable interface and at least two meaningful uses.

## Quality and delivery checklist

- [ ] All data access is authenticated and owner-scoped; role checks run on the server.
- [ ] Client and server validation cover forms and query parameters.
- [ ] Pagination, search, and filters are server-side and composable.
- [ ] CSV export follows the same filters and protects spreadsheet users from formula injection.
- [ ] Money uses exact minor-unit arithmetic and currency is explicit.
- [ ] Receipt upload enforces type/size/ownership and private access.
- [ ] Recurrence and email work are idempotent and safe to retry.
- [ ] Database migrations, environment setup, and feature decisions are documented.
- [ ] Shared components reduce duplication without obscuring feature behavior.
