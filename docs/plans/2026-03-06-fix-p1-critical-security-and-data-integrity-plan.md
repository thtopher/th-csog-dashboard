---
title: "Fix P1 Critical Security and Data Integrity Issues"
type: fix
date: 2026-03-06
priority: p1
status: pending
tags: [security, auth, data-integrity, mpa-pipeline, supabase]
---

# Fix P1 Critical Security and Data Integrity Issues

## Overview

A comprehensive code review identified 11 critical (P1) findings that block production deployment. These fall into two categories: **Auth & Security** (findings 1-6) and **Data Integrity** (findings 7-11). This plan addresses all 11 as a phased effort.

The most severe issue: **zero API routes enforce authentication**, and the Supabase service role key (which bypasses RLS) is used in every route. Combined, this means the entire database is publicly readable and writable.

## Problem Statement

### Auth & Security

1. **No auth on any API route** -- All 19 endpoints are publicly accessible. No route imports `auth()` from `@/lib/auth`.
2. **No middleware.ts** -- No centralized route protection exists.
3. **Demo credentials always active** -- The `Credentials` provider (`demo-login`) is unconditionally registered in `src/lib/auth/config.ts:101-129`, meaning password `"demo"` works in production.
4. **Admin bypass via query param** -- `?admin=true` at `src/app/api/mpa/batches/route.ts:93` and `?all=true` at `src/app/api/data/upload/route.ts:285` grant full data access to any caller.
5. **File upload path injection** -- `src/app/api/storage/upload/route.ts:29` accepts a client-supplied `path` parameter and writes directly to Supabase Storage.
6. **No file type/size validation** -- Both upload endpoints accept any file with no MIME, extension, or size checks.

### Data Integrity

7. **Pro Forma sheet name hardcoded to "PRO FORMA 2025"** -- `src/lib/mpa/loaders.ts:90` -- already broken in 2026.
8. **`calculated_metrics` table in wrong migration directory** -- Exists in `supabase/migrations/002_calculated_metrics.sql` but not in `database/migrations/`. Four API routes depend on it.
9. **Expense detail insert has wrong columns** -- `src/lib/mpa/process.ts:362-369` references `expense_category` and `is_billable` which don't exist in the schema; omits `expense_date` which does.
10. **Race condition on batch processing** -- `src/app/api/mpa/batches/[id]/process/route.ts:78-81` has no optimistic lock. Concurrent requests create duplicate data.
11. **No re-run protection** -- `src/lib/mpa/process.ts:288-390` inserts rows without deleting prior results for the same `batch_id`.

## Key Architectural Decision: Dual Auth System

The codebase has TWO independent auth systems that must be reconciled:

1. **NextAuth session** (JWT-based, server-side) -- `src/lib/auth/index.ts` exports `auth()`, used by zero routes.
2. **localStorage-based demo auth** in `src/contexts/AuthContext.tsx:124-136` -- purely client-side, bypasses NextAuth entirely when `IS_DEMO_MODE` is true.

**Decision: Remove the localStorage auth path.** All logins (including demo) must go through NextAuth's Credentials provider. The `AuthContext.login()` function must always call `nextAuthSignIn('demo-login', ...)` so that a real server-side session exists. Without this, middleware and `requireAuth()` checks will break demo mode (client appears authenticated but server sees no session).

## Proposed Solution

### Phase 1: Authentication & Authorization (Findings 1-4)

#### 1a. Unify demo auth through NextAuth

**File:** `src/contexts/AuthContext.tsx`

- Remove the localStorage-based login path (lines 124-136, 168-180)
- Make `login()` always call `signIn('demo-login', { email, password, redirect: false })`
- Remove `localStorage.getItem('th_dashboard_user')` restore logic
- Keep `IS_DEMO_MODE` only for UI display (showing demo login form vs SSO button)

**File:** `src/lib/auth/config.ts`

- Create a new server-only env var: `DEMO_MODE_ENABLED` (no `NEXT_PUBLIC_` prefix)
- Update `isDemoMode()` to read `process.env.DEMO_MODE_ENABLED === 'true'`
- Conditionally register the Credentials provider:
  ```typescript
  providers: [
    ...(isDemoMode() ? [Credentials({ id: 'demo-login', ... })] : []),
    ...(hasAzureConfig() ? [MicrosoftEntraID({ ... })] : []),
  ],
  ```

#### 1b. Create middleware.ts

**New file:** `src/middleware.ts`

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/health'];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return;

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.match(/\.(ico|png|svg|jpg|css|js)$/)) return;

  if (!req.auth) {
    // API routes: return 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page routes: redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### 1c. Create auth helper functions

**New file:** `src/lib/auth/helpers.ts`

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session!.user.role !== 'admin') {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session, error: null };
}
```

#### 1d. Add auth to all API routes (18 routes)

For each route handler, add at the top:

```typescript
import { requireAuth } from '@/lib/auth/helpers';

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;
  // ... existing logic, using session.user.role for authorization
}
```

**Routes requiring admin or ownership checks:**

| Route | Auth Rule |
|-------|-----------|
| `GET /api/mpa/batches` | Admins see all; others filtered by `created_by === session.user.email` |
| `GET /api/data/upload` (history) | Admins see all; others filtered by own uploads |
| `PATCH /api/mpa/batches/[id]` | Owner or admin only |
| `POST /api/data/proforma-confirm` | Admin or csog_member only |
| `GET /api/uploads/[id]` | Owner or admin only |

**Routes excluded from auth:** `GET /api/health`, `*/api/auth/*`

#### 1e. Remove admin query param bypass

**File:** `src/app/api/mpa/batches/route.ts:93`
- Replace `const isAdmin = searchParams.get('admin') === 'true';` with `const isAdmin = session.user.role === 'admin';`

**File:** `src/app/api/data/upload/route.ts:285`
- Replace `const includeAll = searchParams.get('all') === 'true';` with `const includeAll = session.user.role === 'admin';`

### Phase 2: Upload Security (Findings 5-6)

#### 2a. Fix path injection

**File:** `src/app/api/storage/upload/route.ts`

- Remove client `path` parameter entirely (line 29)
- Always generate server-controlled paths:
  ```typescript
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uploadPath = `uploads/${timestamp}_${safeName}`;
  ```
- If the MPA wizard relies on client-supplied paths, update it to read the path from the API response instead

#### 2b. Add file validation

**New file:** `src/lib/upload/validation.ts`

```typescript
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
  'application/octet-stream', // browsers sometimes report this for Excel
];

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type ${ext} not allowed. Use: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  // Accept octet-stream only if extension is valid (browser MIME reporting is unreliable)
  if (file.type && file.type !== 'application/octet-stream' && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `MIME type ${file.type} not allowed` };
  }

  return { valid: true };
}
```

Add validation call at the top of both upload routes (`storage/upload/route.ts` and `data/upload/route.ts`).

### Phase 3: Data Integrity - MPA Pipeline (Findings 7, 9-11)

#### 3a. Fix Pro Forma sheet name (Finding 7)

**File:** `src/lib/mpa/loaders.ts:90`

Replace:
```typescript
const sheetName = 'PRO FORMA 2025';
```

With:
```typescript
const sheetNamePattern = /pro\s*forma\s*\d{4}/i;
const sheetName = workbook.SheetNames.find(name => sheetNamePattern.test(name));
if (!sheetName) {
  throw new Error(`No Pro Forma sheet found. Expected a sheet matching "PRO FORMA YYYY". Found: ${workbook.SheetNames.join(', ')}`);
}
```

#### 3b. Fix expense detail column mismatch (Finding 9)

**File:** `src/lib/mpa/process.ts:362-369`

Current (wrong):
```typescript
expense_category: null,
is_billable: false,
```

Fix to match `database/migrations/005_monthly_performance_analysis.sql:202-215`:
```typescript
expense_date: exp.expenseDate?.toISOString() ?? null,
amount: exp.amount,
notes: exp.notes ?? null,
```

Also verify that `ExpenseDetail` type in `src/lib/mpa/types.ts` has the correct fields.

#### 3c. Add optimistic lock on batch processing (Finding 10)

**File:** `src/app/api/mpa/batches/[id]/process/route.ts:78-81`

Replace unconditional status update:
```typescript
const { error: updateError } = await supabase
  .from('mpa_analysis_batches')
  .update({ status: 'processing' })
  .eq('id', batchId);
```

With optimistic lock:
```typescript
const { data: lockResult, error: updateError } = await supabase
  .from('mpa_analysis_batches')
  .update({ status: 'processing', started_at: new Date().toISOString() })
  .eq('id', batchId)
  .in('status', ['pending', 'failed'])
  .select('id');

if (!lockResult || lockResult.length === 0) {
  return NextResponse.json(
    { error: 'Batch is already being processed or has completed' },
    { status: 409 }
  );
}
```

This allows re-processing of `failed` batches while preventing concurrent processing.

#### 3d. Add re-run protection (Finding 11)

**File:** `src/lib/mpa/process.ts` — at the start of `saveResults()` (before line 288)

Add cleanup of prior results:
```typescript
// Delete prior results for re-run safety
const childTables = [
  'mpa_revenue_centers', 'mpa_cost_centers', 'mpa_non_revenue_clients',
  'mpa_hours_detail', 'mpa_expenses_detail', 'mpa_pools_detail',
];
for (const table of childTables) {
  const { error } = await supabase.from(table).delete().eq('batch_id', batchId);
  if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
}
```

**Transaction safety note:** The Supabase JS client does not support multi-statement transactions. For Phase 1, sequential DELETE + INSERT is acceptable because:
- The optimistic lock (3c) prevents concurrent execution
- If an INSERT fails after DELETE, the batch status remains `processing` and can be retried

For a future hardening pass, wrap this in a Supabase RPC stored procedure with `BEGIN...COMMIT`.

### Phase 4: Database Migration (Finding 8)

#### 4a. Consolidate calculated_metrics migration

**New file:** `database/migrations/006_calculated_metrics.sql`

Copy from `supabase/migrations/002_calculated_metrics.sql` with idempotency guards:

```sql
-- Migration 006: Consolidate calculated_metrics table
-- (Originally in supabase/migrations/002_calculated_metrics.sql)

CREATE TABLE IF NOT EXISTS calculated_metrics (
  -- ... columns from 002_calculated_metrics.sql ...
  source_upload_id UUID REFERENCES upload_history(id) ON DELETE SET NULL
);

-- Idempotent policy creation
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view metrics" ON calculated_metrics;
  CREATE POLICY "Users can view metrics" ON calculated_metrics FOR SELECT USING (true);
  -- ... other policies ...
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Reuse existing trigger function (from migration 003)
DROP TRIGGER IF EXISTS update_calculated_metrics_updated_at ON calculated_metrics;
CREATE TRIGGER update_calculated_metrics_updated_at
  BEFORE UPDATE ON calculated_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calculated_metrics_metric_id ON calculated_metrics(metric_id);
CREATE INDEX IF NOT EXISTS idx_calculated_metrics_executive_id ON calculated_metrics(executive_id);
```

After applying, verify the table exists and remove the duplicate in `supabase/migrations/` to prevent confusion.

## Acceptance Criteria

### Functional Requirements

- [ ] All API routes (except `/api/auth/*` and `/api/health`) return 401 when called without a valid session
- [ ] Page routes redirect to `/login` when accessed without auth
- [ ] Demo login works end-to-end through NextAuth (not localStorage) when `DEMO_MODE_ENABLED=true`
- [ ] Demo credentials provider is not available when `DEMO_MODE_ENABLED` is unset or `false`
- [ ] `?admin=true` / `?all=true` query params have no effect; admin access determined by session role
- [ ] File uploads reject non-Excel/CSV files and files over 50MB
- [ ] Storage upload paths are always server-generated (no client path injection)
- [ ] MPA Pro Forma loader finds sheet by regex pattern, works for any year
- [ ] MPA expense detail inserts match the actual database schema
- [ ] Concurrent batch processing requests: only the first succeeds, second gets 409
- [ ] Re-processing a failed batch clears old results before inserting new ones
- [ ] `calculated_metrics` table exists in the main migration path

### Non-Functional Requirements

- [ ] Auth check adds < 50ms to API response times
- [ ] Middleware does not affect static asset serving
- [ ] No breaking changes to the existing UI when demo mode is enabled

### Quality Gates

- [ ] All existing tests pass (`npm run test`)
- [ ] Manual test: demo login flow works end-to-end
- [ ] Manual test: unauthenticated API requests return 401 JSON
- [ ] Manual test: upload a non-Excel file, verify rejection
- [ ] Manual test: trigger batch processing twice, verify second request gets 409

## Implementation Order

```
Phase 1a: Unify demo auth (AuthContext + config.ts)     -- Must be first
Phase 1b: Create middleware.ts                           -- Depends on 1a
Phase 1c: Create auth helpers                            -- Independent
Phase 1d: Add auth to all API routes                     -- Depends on 1b, 1c
Phase 1e: Remove admin query param bypass                -- Depends on 1d
Phase 2a: Fix upload path injection                      -- Independent
Phase 2b: Add file validation                            -- Independent
Phase 3a: Fix Pro Forma sheet name                       -- Independent
Phase 3b: Fix expense detail columns                     -- Independent
Phase 3c: Add optimistic lock                            -- Independent
Phase 3d: Add re-run protection                          -- Depends on 3c
Phase 4a: Consolidate migration                          -- Independent
```

Phases 2, 3, and 4 are independent of each other and can be parallelized.

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Demo mode breaks after auth changes | High | High | Phase 1a explicitly reconciles the dual auth system. Test demo flow first. |
| Existing JWT sessions remain valid after disabling demo mode | Medium | Medium | JWT maxAge is 24h. Accept the window or add a `jti` blacklist. |
| Migration 006 conflicts with existing `calculated_metrics` | Medium | Low | `IF NOT EXISTS` guards on all statements. |
| MPA wizard breaks after removing client `path` param | Medium | Medium | Check MPA wizard code to see if it reads path from batch creation response. |
| File validation rejects legitimate Excel files | Low | Medium | Accept `application/octet-stream` with extension fallback check. |

## Files Changed

### New Files
- `src/middleware.ts`
- `src/lib/auth/helpers.ts`
- `src/lib/upload/validation.ts`
- `database/migrations/006_calculated_metrics.sql`

### Modified Files
- `src/lib/auth/config.ts` -- Gate demo provider, update `isDemoMode()`
- `src/contexts/AuthContext.tsx` -- Remove localStorage auth, use NextAuth for demo
- `src/app/api/mpa/batches/route.ts` -- Add auth, fix admin bypass
- `src/app/api/data/upload/route.ts` -- Add auth, fix admin bypass, add file validation
- `src/app/api/storage/upload/route.ts` -- Add auth, fix path injection, add file validation
- `src/app/api/mpa/batches/[id]/process/route.ts` -- Add auth, add optimistic lock
- `src/app/api/executives/route.ts` -- Add auth
- `src/app/api/executives/[id]/route.ts` -- Add auth
- `src/app/api/metrics/route.ts` -- Add auth
- `src/app/api/mpa/batches/[id]/route.ts` -- Add auth
- `src/app/api/mpa/batches/[id]/results/route.ts` -- Add auth
- `src/app/api/mpa/batches/[id]/detail/[type]/[code]/route.ts` -- Add auth
- `src/app/api/uploads/compliance/route.ts` -- Add auth
- `src/app/api/uploads/[id]/route.ts` -- Add auth
- `src/app/api/data/proforma-confirm/route.ts` -- Add auth
- `src/app/api/annotations/route.ts` -- Add auth
- `src/app/api/kpis/process/[processId]/route.ts` -- Add auth
- `src/app/api/onboarding/state/route.ts` -- Add auth
- `src/app/api/onboarding/complete/route.ts` -- Add auth
- `src/lib/mpa/loaders.ts` -- Fix Pro Forma sheet name
- `src/lib/mpa/process.ts` -- Fix expense columns, add re-run protection
- `.env.example` -- Add `DEMO_MODE_ENABLED` env var

## References

- NextAuth v5 middleware docs: https://authjs.dev/getting-started/session-management/protecting
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Code review findings: this plan addresses all 11 P1 findings from the 2026-03-06 review
