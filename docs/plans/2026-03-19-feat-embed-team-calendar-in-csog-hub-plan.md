---
title: "feat: Embed Team Calendar in CSOG Hub"
type: feat
date: 2026-03-19
---

# Embed Team Calendar in CSOG Hub

## Overview

Add a 5th "Team Calendar" tab to the CSOG Hub (`/csog`) by porting UI components from the standalone `th-team-calendar` app. The calendar displays employee PTO (synced from BambooHR), holidays, milestones, data updates, and firm events across three view modes (month, week, swimlane). The embedded version is read-only — no admin controls, no dark mode. Data stays in the calendar's Turso database; the dashboard proxies API calls to avoid CORS issues.

## Problem Statement / Motivation

CSOG members currently need to switch between the dashboard and the standalone team calendar app to view team availability alongside operational data. Embedding the calendar in the Hub creates a single pane of glass for operational awareness.

## Proposed Solution

Port the calendar's React components into `src/components/csog/calendar/`, add two thin proxy API routes that forward to `th-team-calendar.vercel.app`, and wire up a new tab in the CSOG Hub page.

## Technical Approach

### Phase 1: Proxy API Routes

Create two authenticated proxy routes that forward requests to the deployed calendar API.

**New files:**

- `src/app/api/calendar/events/route.ts` — `GET` proxies to `https://th-team-calendar.vercel.app/api/events`
- `src/app/api/calendar/sync-status/route.ts` — `GET` proxies to `https://th-team-calendar.vercel.app/api/sync/status`

**Pattern** (follows existing `src/app/api/strategic-goals/route.ts`):
```ts
// src/app/api/calendar/events/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';

const UPSTREAM = 'https://th-team-calendar.vercel.app';

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const res = await fetch(`${UPSTREAM}/api/events`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (err) {
    console.error('Calendar proxy error:', err);
    return NextResponse.json(
      { error: 'Unable to load calendar data' },
      { status: 502 }
    );
  }
}
```

Sync-status route follows the same pattern targeting `/api/sync/status`.

**Design decisions:**
- `requireAuth()` enforces dashboard auth — upstream API is open
- 8-second timeout stays within Vercel's serverless limits
- 5-minute `Cache-Control` reduces repeated upstream calls
- No query param forwarding needed — upstream `/api/events` returns all events, filtering is client-side
- 502 response on upstream failure for clear error attribution

---

### Phase 2: Port Calendar Library Code

Copy and adapt utility/type files into a dedicated subdirectory.

**New files under `src/lib/calendar/`:**

| File | Source | Modifications |
|------|--------|---------------|
| `types.ts` | `th-team-calendar/app/src/lib/types.ts` | As-is |
| `calendar-utils.ts` | `th-team-calendar/app/src/lib/calendar.ts` | Replace `date-fns` imports to match dashboard style (already installed) |
| `color-utils.ts` | `th-team-calendar/app/src/lib/utils.ts` | Remove `cn()` (use existing `@/lib/utils/cn`), keep `getEventColor()`, `getCategoryLabel()`, `getStatusLabel()` |
| `use-events.ts` | `th-team-calendar/app/src/lib/use-events.ts` | Strip `createEvent`, `updateEvent`, `deleteEvent`. Change fetch URL to `/api/calendar/events`. Add error state. |
| `use-url-filters.ts` | `th-team-calendar/app/src/lib/use-url-filters.ts` | Preserve existing `tab` param when writing filters (see Query Param Coordination below) |

---

### Phase 3: Port Calendar Components

Copy components into `src/components/csog/calendar/`.

| File | Source | Modifications |
|------|--------|---------------|
| `TeamCalendar.tsx` | `Calendar.tsx` | **Heavy edits**: strip admin login/logout, dark mode toggle, event form, pending PTO modal, sync trigger button. Keep: view switcher, date navigation, filter sidebar toggle, event detail (read-only), capacity bar, legend. Remove all `isAdmin` / `darkMode` state and props. |
| `MonthView.tsx` | `MonthView.tsx` | Remove dark mode classes. Update imports to `@/lib/calendar/` and `@/lib/utils/cn`. |
| `WeekView.tsx` | `WeekView.tsx` | Same treatment as MonthView. |
| `SwimlaneView.tsx` | `SwimlaneView.tsx` | Same treatment as MonthView. |
| `FilterSidebar.tsx` | `FilterSidebar.tsx` | Remove dark mode classes. Update imports. |
| `EventDetail.tsx` | `EventDetail.tsx` | Remove edit/delete buttons and `onEdit`/`onDelete` props. Keep close button, event info display, PTO status badge, BambooHR link. |
| `EventPill.tsx` | `EventPill.tsx` | Remove dark mode classes. Update imports. |
| `CapacityBar.tsx` | `CapacityBar.tsx` | Remove dark mode classes. Update imports. |
| `Legend.tsx` | `Legend.tsx` | Remove dark mode classes. Update imports. |

**Not ported:** `AdminLogin.tsx`, `EventForm.tsx`, `PendingPTOModal.tsx`, `use-admin.ts`, `use-dark-mode.ts`, `db.ts`, `bamboohr.ts`, `sync.ts`.

---

### Phase 4: Wire Up CSOG Hub Tab

**Edit `src/app/csog/page.tsx`:**

1. Import `CalendarDays` from `lucide-react`
2. Import `TeamCalendar` from `@/components/csog/calendar/TeamCalendar`
3. Add to `TABS` array:
   ```ts
   { id: 'calendar', label: 'Team Calendar', icon: CalendarDays },
   ```
4. Add conditional render:
   ```tsx
   {activeTab === 'calendar' && <TeamCalendar />}
   ```

**Wrap in `<Suspense>`:** The `useUrlFilters` hook uses `useSearchParams()` which requires Suspense in Next.js App Router. The CSOG page already wraps content in `<Suspense>`, so this is covered.

---

### Query Param Coordination

The CSOG Hub uses `?tab=calendar` and the calendar uses `?employees=...&categories=...&view=...`. Both write to URL query params.

**Current behavior:** `handleTabChange` in `page.tsx` uses `url.searchParams.set('tab', tab)` which preserves other params. The calendar's `useUrlFilters` uses `new URLSearchParams(searchParams.toString())` which also preserves existing params.

**Verification needed:** Confirm that `useUrlFilters` preserves the `tab` param when it writes filter params. The source code shows it reads `searchParams.toString()` as the base and only sets/deletes `employees`, `categories`, and `view` — so `tab` is preserved. No modifications needed.

**Tab switch behavior:** When switching away from the calendar tab and back, filter params remain in the URL and are restored automatically.

---

### Loading & Error States

The calendar is the only CSOG Hub tab requiring a network fetch on mount. Add appropriate states:

- **Loading:** Skeleton matching the calendar layout (header bar + grid placeholder) using `animate-pulse` (consistent with dashboard patterns)
- **Error:** Centered message "Unable to load calendar data" with a "Try again" button that calls `refetch()`
- **Empty:** "No events found" message (unlikely but handled)

---

### Responsive Behavior

The CSOG Hub constrains content to `max-w-7xl`. The calendar must fit within this:

- **Desktop (lg+):** Filter sidebar inline (left), calendar view (right) — matches original layout
- **Tablet/Mobile (<lg):** Filter sidebar as collapsible overlay, calendar view full-width — matches original responsive behavior

The original calendar already handles this, so no additional responsive work is needed beyond removing dark mode classes.

## Acceptance Criteria

- [x] "Team Calendar" appears as 5th tab in CSOG Hub with `CalendarDays` icon
- [x] `?tab=calendar` URL param activates the calendar tab
- [x] Month, Week, and Swimlane views render correctly with view switching
- [x] Filter sidebar toggles and filters by employee/category
- [x] Event pills are clickable and show read-only detail modal
- [x] PTO events display with correct status colors (pending=gray, approved=green, declined=red)
- [x] Capacity bars show headcount-out-per-day alerts
- [x] Conflict alerts (3+ people off) display correctly
- [x] No admin UI present (no create/edit/delete, no sync trigger, no admin login)
- [x] No dark mode toggle or dark mode styling
- [x] Proxy routes require authentication (return 401 if unauthenticated)
- [x] Proxy routes return 502 with error message on upstream failure
- [x] Calendar filter params (`employees`, `categories`, `view`) coexist with `tab` param in URL
- [x] Loading skeleton shown while events are fetching
- [x] Error state shown if proxy call fails, with retry button

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Upstream calendar app downtime breaks the tab | 502 error state with retry; other tabs unaffected |
| Query param collisions between tab and filter state | Verified both URL-writing mechanisms preserve each other's params |
| Stale PTO data if BambooHR sync fails | Display "Last synced" timestamp from sync-status endpoint |
| Large component surface area to port | Incremental approach: proxy routes first, then core views, then polish |

## File Summary

### New files (14)

```
src/app/api/calendar/events/route.ts
src/app/api/calendar/sync-status/route.ts
src/lib/calendar/types.ts
src/lib/calendar/calendar-utils.ts
src/lib/calendar/color-utils.ts
src/lib/calendar/use-events.ts
src/lib/calendar/use-url-filters.ts
src/components/csog/calendar/TeamCalendar.tsx
src/components/csog/calendar/MonthView.tsx
src/components/csog/calendar/WeekView.tsx
src/components/csog/calendar/SwimlaneView.tsx
src/components/csog/calendar/FilterSidebar.tsx
src/components/csog/calendar/EventDetail.tsx
src/components/csog/calendar/EventPill.tsx
src/components/csog/calendar/CapacityBar.tsx
src/components/csog/calendar/Legend.tsx
```

### Modified files (1)

```
src/app/csog/page.tsx  — Add calendar tab + import
```

## References

- Brainstorm: `docs/brainstorms/2026-03-19-team-calendar-tab-brainstorm.md`
- Source project: `/Users/topher416/th-team-calendar`
- Deployed calendar: `https://th-team-calendar.vercel.app/`
- CSOG Hub page: `src/app/csog/page.tsx`
- Existing tab components: `src/components/csog/`
- API route pattern: `src/app/api/strategic-goals/route.ts`
- Auth helpers: `src/lib/auth/helpers.ts`
