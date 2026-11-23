# Personal Finance App

A staged full-stack expense tracker built to practice real-world application patterns. The implementation plan and feature exit criteria live in [blueprint.md](./blueprint.md).

## Stack decisions

- Next.js App Router, React, TypeScript, and Node.js.
- PostgreSQL with Prisma migrations for persistence.
- Better Auth for email/password authentication and database-backed sessions.
- Zod for shared client/server input schemas.
- Recharts for dashboard charts.
- Private object storage and adapters for email and scheduled jobs when those features are added.

The repository is being built in stages. The current implementation includes email/password authentication, protected routes, owner-scoped account and category settings, and transaction management.

## Accounts and categories

Accounts and categories are private to their owner. Names are trimmed and unique per user without regard to capitalization. Archived records are hidden from active lists and selectors; their names remain reserved. Account opening balances are stored as signed integer minor units with an explicit three-letter currency code (for example, USD 12345 represents $123.45). Apply schema changes with `npm run db:migrate -- --name <migration_name>` locally and `npm run db:deploy` in deployment environments.

## Transactions and balances

Transaction amounts are positive integer minor units stored with an account's currency; transaction type (`INCOME` or `EXPENSE`) determines the balance direction. Account balances are derived as opening balance + income − expenses and are grouped per account, so unlike currencies are never added together. Amount entry follows the selected currency's fraction digits and is capped at 2,000,000,000 minor units. Transaction dates are calendar dates stored at UTC midnight (PostgreSQL `DATE`), independent of the viewer's timezone. New transactions can reference only active accounts and categories owned by the signed-in user; edits can keep an already referenced archived account/category, and all other cross-user or incompatible references are rejected. Deleting a transaction removes it permanently. Apply the Stage 3 migration with `npm run db:deploy` after reviewing the generated migration.

## Requirements

- Node.js 20.19 or newer (Node.js 24 is recommended for Prisma 7).
- A local or hosted PostgreSQL database.
- npm 10 or newer.

## Local development

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Keep `.env` private; do not commit real credentials.
2. Generate an auth secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and set it as `BETTER_AUTH_SECRET`.
3. Install dependencies with `npm install`.
4. Apply the database schema with `npm run db:migrate -- --name init`.
5. Generate the typed Prisma client with `npm run db:generate`.
6. Start the app with `npm run dev` and open [http://localhost:3000](http://localhost:3000).

Password reset links are logged to the server console in development when SMTP is not configured. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` to deliver reset email. Production requires a working SMTP configuration and a generated secret.

Useful commands:

```sh
npm run dev       # local development server
npm run lint      # ESLint
npm run typecheck # TypeScript validation
npm run build     # production build
```

Use `npm run db:deploy` to apply committed migrations in production. `npm run db:studio` opens Prisma Studio for local inspection.
