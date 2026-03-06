# CLAUDE.md

## Project Overview

Third Horizon Executive Dashboard — web application for CSOG (Chief Strategies & Operations Group) members to monitor firm operational health. Features CEO Scorecard, executive views, Monthly Performance Analysis (MPA), upload management, and RACI matrix aligned with Third Horizon SOPs.

**Repo:** https://github.com/thtopher/th-csog-dashboard.git
**GitHub account:** thtopher (`topher@thirdhorizon.com`)
**Version:** v2.1 (January 2026)

## Tech Stack

- Next.js 16 with App Router
- React 19 + TypeScript 5
- Tailwind CSS 4
- Radix UI (dialog, dropdown-menu, select, tabs, tooltip)
- Recharts for data visualization
- SheetJS (xlsx) for Excel file parsing
- Supabase (PostgreSQL + Storage)
- NextAuth.js 5 with Microsoft Entra ID (Azure AD) SSO
- Vitest for testing

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
npm run test         # Run Vitest suite
npm run test:watch   # Watch mode tests
npx vitest run src/__tests__/<file>.test.ts  # Run a single test file
```

## Environment Variables

Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_CLIENT_ID=...          # Optional — leave blank for demo mode
AZURE_AD_CLIENT_SECRET=...
AZURE_AD_TENANT_ID=...
NEXT_PUBLIC_DEMO_MODE=true      # Enables demo login (password: "demo")
```

## Deployment

- Vercel (configured via `vercel.json`)
- Push to deploy

## Architecture

### App Structure

- `src/app/page.tsx` — CEO Scorecard (main dashboard)
- `src/app/executive/[id]/` — Executive detail pages
- `src/app/monthly-performance/` — MPA upload wizard & results
- `src/app/upload/` — Data upload page
- `src/app/admin/` — Admin panel
- `src/app/login/`, `onboarding/`, `settings/` — Auth, first-run, user settings
- `src/app/api/` — API routes (see Key API Routes below)

### Provider Hierarchy

Defined in `src/app/providers.tsx`, imported by `layout.tsx`:
`SessionProvider` (NextAuth) → `AuthProvider` (`src/contexts/AuthContext.tsx`) → `TemporalProvider` (`src/contexts/TemporalContext.tsx`)

### Key Libraries

- `src/lib/mpa/` — MPA Processing Pipeline (see section below). Entry point: `process.ts`.
- `src/lib/upload/` — Upload parsing pipeline: `parser.ts`, `mapper.ts`, `validator.ts`, `schemas.ts`, `scheduleUtils.ts`.
- `src/lib/supabase/` — Two clients: `client.ts` (browser, anon key with RLS) and `server.ts` (API routes, service role key). `storage.ts` for file uploads. `types.ts` for generated DB types.
- `src/lib/auth/config.ts` — NextAuth config (Microsoft Entra ID SSO + demo credential login).
- `src/lib/metrics/calculateMetrics.ts` — Computes dashboard KPIs from uploaded Excel data.
- `src/lib/utils/` — `cn.ts` (Tailwind class merging), `format.ts`, `dataSourceMapping.ts`.

### Configuration Layer

`src/config/` contains static definitions that drive the UI and business logic:
- `src/config/executives.ts` — 7 C-Suite members
- `src/config/executiveScorecards.ts` — Scorecard metric categories & KPIs
- `src/config/processDefinitions.ts` — 41 SOP-aligned processes
- `src/config/uploadTypes.ts` — 14 upload types with executive permissions
- `src/config/uploadSchedule.ts` — Upload calendar scheduling
- `src/config/domains.ts` — Domain configuration

### Components

`src/components/` subdirectories: `dashboard/`, `monthly-performance/`, `timeline/`, `uploads/`, `upload/` (mapper/preview/validation), `onboarding/`, `raci/`, `layout/`, `common/`, `domain/`, `process/`, `progress/`.

### Tests

Tests live in `src/__tests__/` and use Vitest. Config in `vitest.config.ts` (aliases `@` to `./src`).

## Key API Routes

- `POST /api/mpa/batches` — Create MPA batch
- `POST /api/mpa/batches/[id]/process` — Run MPA analysis pipeline
- `GET /api/mpa/batches/[id]/results` — Get analysis results
- `GET /api/mpa/batches/[id]/detail/[type]/[code]` — Drill-down
- `GET /api/executives` — All executives with scorecard data
- `GET /api/metrics` — Dashboard metrics
- `POST /api/storage/upload` — File upload to Supabase Storage
- `GET /api/uploads/compliance` — Upload compliance tracking
- `POST /api/data/upload` — Process uploaded data files

## MPA Processing Pipeline

Mirrors the standalone Python MPA application, reimplemented in TypeScript. Ingests 5 Excel files (Pro Forma, Compensation, Harvest Hours, Harvest Expenses, P&L) and runs classification → allocation → computation → validation. Business rules are documented in `docs/mpa-business-rules.md`.

## Authentication

- **Production:** Microsoft Entra ID SSO (email domain validation)
- **Development:** Demo mode with preset accounts (password: "demo")
- **Roles:** admin, csog_member, staff

## Demo Accounts (when NEXT_PUBLIC_DEMO_MODE=true)

- david@thirdhorizon.com (CEO, admin)
- greg@thirdhorizon.com (President)
- jordana@thirdhorizon.com (COO)
- aisha@thirdhorizon.com (CFO)
- chris@thirdhorizon.com (CDAO)
- cheryl@thirdhorizon.com (CGO)
- ashley@thirdhorizon.com (CSO)
- topher@thirdhorizon.com (Admin)

## Database

Supabase with 5 migrations (`database/migrations/`) covering: executives, users, SOP processes (41), RACI tasks (154), upload tracking, file storage, and MPA analysis tables. Seeds in `database/seeds/`.

## Documentation

- `docs/mpa-business-rules.md` — Detailed MPA pipeline rules and Excel parsing logic
- `docs/excel-templates.md` — Expected Excel file formats
- `docs/Third_Horizon_SOP.md` — Standard operating procedures
- `docs/SOP_ALIGNMENT_ANALYSIS.md` — How dashboard processes map to SOPs

## Path Alias

`@/*` maps to `./src/*`.
