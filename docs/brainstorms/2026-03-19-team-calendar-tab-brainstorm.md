---
date: 2026-03-19
topic: team-calendar-tab
---

# Embed Team Calendar in CSOG Hub

## What We're Building

Add a 5th tab ("Team Calendar") to the CSOG Hub that embeds the full th-team-calendar UI — month, week, and swimlane views with filtering — in read-only mode. The calendar's Turso database remains the source of truth; the dashboard proxies API calls through its own routes.

## Source Project

- Repo: `/Users/topher416/th-team-calendar`
- Deployed: https://th-team-calendar.vercel.app/
- Stack: Next.js 16, React 19, Turso (SQLite), BambooHR integration

## Key Decisions

- **Data backend stays on Turso**: No Supabase migration. Dashboard proxies to the calendar's deployed API.
- **Proxy pattern**: Dashboard gets `/api/calendar/events` and `/api/calendar/sync-status` routes that forward to `th-team-calendar.vercel.app`. Avoids CORS issues and keeps the calendar app untouched.
- **Read-only**: No admin login, event creation/editing, delete, or sync trigger in the embedded version.
- **No dark mode**: Calendar's dark mode toggle is stripped.
- **Filters preserved**: Employee and category filter sidebar remains as-is.
- **All 3 views**: Month, Week, and Swimlane views all included.

## Components to Port

From `th-team-calendar/app/src/`:

| Component | Include | Notes |
|-----------|---------|-------|
| Calendar.tsx | Yes (modified) | Strip admin UI, dark mode, event form |
| MonthView.tsx | Yes | As-is |
| WeekView.tsx | Yes | As-is |
| SwimlaneView.tsx | Yes | As-is |
| FilterSidebar.tsx | Yes | As-is |
| EventDetail.tsx | Yes (modified) | Strip edit/delete buttons |
| EventPill.tsx | Yes | As-is |
| CapacityBar.tsx | Yes | As-is |
| Legend.tsx | Yes | As-is |
| PendingPTOModal.tsx | No | Admin feature |
| AdminLogin.tsx | No | Admin feature |
| EventForm.tsx | No | Admin feature |

## Hooks & Utils to Port

| File | Include | Notes |
|------|---------|-------|
| lib/types.ts | Yes | As-is |
| lib/calendar.ts | Yes | As-is |
| lib/utils.ts | Yes | Merge with existing cn() util |
| hooks/useEvents.ts | Yes (modified) | Point to proxy API, strip mutations |
| hooks/useUrlFilters.ts | Yes | As-is |
| hooks/useDarkMode.ts | No | Dropped |
| hooks/useAdmin.ts | No | Admin feature |

## API Proxy Routes (New)

- `GET /api/calendar/events` → proxies `th-team-calendar.vercel.app/api/events`
- `GET /api/calendar/sync-status` → proxies `th-team-calendar.vercel.app/api/sync/status`

## CSOG Hub Tab Addition

```ts
{ id: 'calendar', label: 'Team Calendar', icon: CalendarDays }
```

## Open Questions

- None — ready for planning.

## Next Steps

-> `/workflows:plan` for implementation details
