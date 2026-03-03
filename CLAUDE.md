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

```
src/
  app/
    page.tsx                    # CEO Scorecard (main dashboard)
    admin/                      # Admin panel
    executive/[id]/             # Executive detail pages
    monthly-performance/        # MPA upload wizard & results
    upload/                     # Data upload page
    login/                      # Auth page
    onboarding/                 # First-run setup
    settings/                   # User settings
    api/                        # API routes (see below)
  components/
    dashboard/                  # CEO Scorecard, ExecutiveTile, GlobalFilters
    monthly-performance/        # MPA upload wizard & results
    timeline/                   # Upload calendar views
    uploads/                    # Upload forms & file managers
    onboarding/                 # Onboarding flow
    raci/                       # RACI matrix display
    layout/                     # Header, nav, sidebar
    common/                     # Reusable UI elements
  lib/
    mpa/                        # MPA Processing Pipeline
      process.ts                # Main orchestrator
      loaders.ts                # Excel file parsing
      classification.ts         # Project classification
      allocations.ts            # Overhead allocation
      computations.ts           # Margin calculations
      validators.ts             # Data validation
      config.ts                 # Constants
      types.ts                  # Interfaces
    auth/config.ts              # NextAuth config (SSO + demo mode)
    supabase/                   # Client, server, storage, types
  config/
    executives.ts               # 7 C-Suite members
    executiveScorecards.ts      # Scorecard metric categories & KPIs
    processDefinitions.ts       # 41 SOP-aligned processes
    uploadTypes.ts              # 14 upload types with permissions
    uploadSchedule.ts           # Upload calendar scheduling
  contexts/
    AuthContext.tsx              # User auth state
    TemporalContext.tsx          # Time period filtering
database/
  migrations/                   # 5 SQL migration files
  seeds/                        # 6 seed files (executives, processes, RACI, KPIs)
```

## Key API Routes

- `POST /api/mpa/batches` — Create MPA batch
- `POST /api/mpa/batches/[id]/process` — Run MPA analysis pipeline
- `GET /api/mpa/batches/[id]/results` — Get analysis results
- `GET /api/mpa/batches/[id]/detail/[type]/[code]` — Drill-down
- `GET /api/executives` — All executives with scorecard data
- `GET /api/metrics` — Dashboard metrics
- `POST /api/storage/upload` — File upload to Supabase Storage
- `GET /api/uploads/compliance` — Upload compliance tracking

## MPA Processing Pipeline

The `src/lib/mpa/` module mirrors the standalone Python app at `/Users/topher416/TH Monthly Performance Analysis` but reimplemented in TypeScript for the web dashboard. Same 5-file ingestion, same classification/allocation/validation logic.

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

Supabase with 5 migrations covering: executives, users, SOP processes (41), RACI tasks (154), upload tracking, file storage, and MPA analysis tables (batches, revenue centers, cost centers, non-revenue clients, hours/expense detail).

## Path Alias

`@/*` maps to `./src/*`.
