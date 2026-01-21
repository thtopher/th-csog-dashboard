# Third Horizon CSOG Dashboard - SOP Alignment Analysis

**Document Version:** 1.0
**Created:** 2026-01-20
**Author:** Claude (via Topher)
**Purpose:** Compare the Third Horizon SOP against the current dashboard implementation and identify required changes

---

## Executive Summary

The Third Horizon SOP (Standard Operating Procedures Workbook) defines a comprehensive operational framework for the organization. The current CSOG Dashboard was built as a placeholder/prototype and requires significant restructuring to properly reflect the SOP's organizational model.

**Bottom Line:** The dashboard needs to evolve from a generic KPI tracker into a true **SOP-aligned executive control center** that mirrors the organization's actual structure, processes, functions, and RACI accountability model.

---

## Part 1: Current State Analysis

### Dashboard Structure (As-Built)

| Layer | Current Implementation |
|-------|----------------------|
| **Domains** | 6 generic domains (Growth, Delivery, Closure, Finance, Ops, Board) |
| **Processes** | 21 sample processes with SOP status tracking |
| **KPIs** | 13 defined KPIs with targets/thresholds |
| **Users** | 5 role types (admin, csog_member, steward, staff, viewer) |
| **Accountability** | Single "steward" per domain/process |

### SOP Structure (Required)

| Layer | SOP Definition |
|-------|---------------|
| **Executives** | 7 C-suite roles (CEO, President, COO, CFO, CDAO, CGO, CSO) |
| **Domains** | 7 executive domains aligned to accountability |
| **Functions** | 14 governance functions (F-prefix, e.g., F-EOC, F-CAI) |
| **Processes** | 27 operational processes (e.g., AR, BD, SD) |
| **Tasks** | 200+ individual tasks with IDs (e.g., F-EOC1, BD3) |
| **RACI** | Every task has Accountable, Responsible, Contributor, Informed assignments |

---

## Part 2: Gap Analysis

### CRITICAL GAP 1: Executive-Centric Domain Model

**Current:** Domains are generic business areas
**Required:** Domains must map to executive accountability per the SOP

| SOP Executive | Domain | Current Dashboard Mapping |
|---------------|--------|--------------------------|
| CEO (David Smith) | Business Oversight | ❌ Not represented |
| President (Greg Williams) | Client Operations | ❌ Not represented |
| COO (Jordana Choucair) | Business Operations | ⚠️ Partial (Internal Operations) |
| CFO (Finance) | Finance | ✅ Exists |
| CDAO (Chris Hart) | Data Systems & IT | ❌ Not represented |
| CGO (Cheryl Matochik) | Growth | ✅ Exists |
| CSO (Ashley DeGarmo) | Client Engagement | ⚠️ Partial (Delivery, Closure) |

**Action Required:** Restructure domains to match the 7 executive areas.

---

### CRITICAL GAP 2: Process vs. Function Distinction

**Current:** Dashboard only has "processes"
**Required:** SOP distinguishes between:

- **Processes:** Recurring operational workflows (e.g., AR, BD, SD)
- **Functions:** Ongoing governance responsibilities (F-prefix, e.g., F-EOC, F-SP)

The dashboard needs a new entity type for **Functions** or a `type` field on processes.

| Type | Count in SOP | Examples |
|------|-------------|----------|
| Processes | 27 | AR (Accounts Receivable), BD (Business Development), SD (Service Delivery) |
| Functions | 14 | F-EOC (Executive Operating Cadence), F-SP (Strategic Planning), F-ER (Enterprise Risk) |

---

### CRITICAL GAP 3: RACI Framework Not Modeled

**Current:** Single "steward" field per domain/process
**Required:** Full RACI matrix per task

```
RACI Roles:
- R (Responsible): Does the work
- A (Accountable): Owns the outcome (ONLY ONE per task)
- C (Contributor): Provides input
- I (Informed): Receives updates
```

**Example from SOP (F-EOC6 - CEO Scorecard):**
| Role | Assignment |
|------|------------|
| Accountable | David (CEO) |
| Responsible | Topher |
| Contributor | CSOG |
| Informed | Board of Managers |

The dashboard cannot currently represent this relationship structure.

---

### CRITICAL GAP 4: Task-Level Granularity

**Current:** Processes contain KPIs
**Required:** Processes/Functions contain Tasks with RACI assignments

The SOP defines 200+ tasks like:
- F-EOC1: "Own the company operating system..."
- BD3: "Draft Scope of Work outlining duties, timeline..."
- AR5: "Follow up on outstanding accounts receivable..."

Each task needs:
- Unique ID (e.g., F-EOC6)
- Description
- RACI assignments
- Process/Function parent
- Status tracking

---

### CRITICAL GAP 5: CEO Scorecard Requirements (F-EOC6)

The SOP (Task F-EOC6) specifically defines what the CEO scorecard must track:

| Required Metric | Current Dashboard Status |
|-----------------|-------------------------|
| Pipeline Health | ✅ Active Pipeline Value KPI exists |
| Delivery Health | ⚠️ On-Time Delivery exists but needs alignment |
| Margin | ❌ Not tracked |
| Cash | ❌ Not tracked (DSO is partial) |
| Staffing Capacity | ⚠️ Billable Utilization exists |
| Strategic Initiatives | ⚠️ Generic "Strategic Initiatives" count exists |

---

### CRITICAL GAP 6: Missing Processes

Many SOP processes have no dashboard representation:

| Process Code | Name | Executive | Status |
|--------------|------|-----------|--------|
| CR | Compensation & Role Changes | President | ❌ Missing |
| TP | Tax Preparation & Filing | President | ❌ Missing |
| CF | Cash Flow Management | President | ❌ Missing |
| VM | Contractor/Vendor Management | President | ❌ Missing |
| OC | Operationalizing Client Contracts | COO | ❌ Missing |
| EO | Employee Onboarding | COO | ❌ Missing |
| ES/ET | Employee Separation | COO | ❌ Missing |
| PM | Performance Management | COO | ❌ Missing |
| SA | Starset Analytics | CDAO | ❌ Missing |
| HMRF | Hospital MRF Database | CDAO | ❌ Missing |
| CA | Corrective Action | CSO | ❌ Missing |
| CiS | Change in Scope | CSO | ❌ Missing |

---

### CRITICAL GAP 7: Missing Functions

All 14 governance functions need representation:

| Function Code | Name | Executive | Priority |
|---------------|------|-----------|----------|
| F-EOC | Executive Operating Cadence | CEO | HIGH |
| F-CAI | Capital Allocation & Investment | CEO | HIGH |
| F-QAD | Quality Assurance & Delivery | CEO | HIGH |
| F-SP | Strategic Planning | CEO | HIGH |
| F-PEM | Partnership & Ecosystem | CEO | MEDIUM |
| F-CRC | Client Executive Relationships | CEO | MEDIUM |
| F-CPE | Community & Political Engagement | CEO | LOW |
| F-IP | Intellectual Property | President | MEDIUM |
| F-OC | Org Chart Management | President | LOW |
| F-ER | Enterprise Risk Management | President | HIGH |
| F-KM | Knowledge Management | President | MEDIUM |
| F-BOM | Board of Managers | COO | MEDIUM |
| F-IT | Information Technology | CDAO | HIGH |
| F-CDH | Client Confidentiality | CSO | HIGH |

---

## Part 3: Data Model Changes Required

### New Entities Needed

#### 1. Executive
```typescript
interface Executive {
  id: string;
  name: string;           // "David Smith"
  title: string;          // "CEO"
  role: string;           // "Business Oversight"
  email: string;
  displayOrder: number;
}
```

#### 2. ProcessType Enhancement
```typescript
type ProcessType = 'process' | 'function';

interface Process {
  // ... existing fields
  processType: ProcessType;  // NEW: distinguish process vs function
  executiveId: string;       // NEW: link to accountable executive
  code: string;              // NEW: SOP code (e.g., "AR", "F-EOC")
}
```

#### 3. Task (New Entity)
```typescript
interface Task {
  id: string;
  processId: string;
  code: string;              // "F-EOC6", "BD3"
  description: string;
  accountableId: string;     // Executive or person
  responsibleId: string;     // Person doing the work
  contributors: string[];    // People providing input
  informed: string[];        // People kept in loop
  status: TaskStatus;
  displayOrder: number;
}

type TaskStatus = 'active' | 'in_progress' | 'completed' | 'blocked';
```

#### 4. RACI Assignment (New Entity)
```typescript
interface RACIAssignment {
  id: string;
  taskId: string;
  personId: string;          // User or Executive
  role: 'A' | 'R' | 'C' | 'I';
}
```

### Enhanced User Model
```typescript
interface User {
  // ... existing fields
  executiveId?: string;      // Link to Executive if C-suite
  title?: string;            // Job title
  reportsTo?: string;        // Manager
}
```

---

## Part 4: UI/UX Changes Required

### Navigation Restructure

**Current:** Flat domain list
**Required:** Executive-centric hierarchy

```
Dashboard (CEO Scorecard)
├── CEO Domain (David Smith)
│   ├── F-EOC: Executive Operating Cadence
│   ├── F-CAI: Capital Allocation
│   ├── F-QAD: Quality Assurance
│   └── ... other CEO functions
├── President Domain (Greg Williams)
│   ├── CF: Cash Flow Management
│   ├── CR: Compensation & Role Changes
│   ├── F-IP: IP Governance
│   └── ... other President processes/functions
├── COO Domain (Jordana Choucair)
│   └── ...
├── CFO Domain (Finance)
│   └── ...
├── CDAO Domain (Chris Hart)
│   └── ...
├── CGO Domain (Cheryl Matochik)
│   └── ...
└── CSO Domain (Ashley DeGarmo)
    └── ...
```

### New Views Needed

1. **Executive Dashboard** - Per-executive view showing their processes/functions
2. **RACI Matrix View** - Table showing who is R/A/C/I for each task
3. **Task Detail View** - Individual task with RACI and status
4. **Function vs Process Filter** - Toggle between governance and operational views

### CEO Scorecard Enhancement

The root dashboard should become the F-EOC6 CEO Scorecard showing:
- Pipeline Health (from CGO/BD)
- Delivery Health (from CSO/SD)
- Margin (from CFO/Finance)
- Cash (from President/CF)
- Staffing Capacity (from COO/ST)
- Strategic Initiatives (from CEO/F-SP)

---

## Part 5: Implementation Priority

### Phase 1: Data Model Foundation (HIGH PRIORITY)

1. Add `Executive` entity and seed with 7 executives
2. Add `processType` and `executiveId` to Process
3. Add `code` field to Process for SOP codes
4. Create `Task` entity
5. Create `RACIAssignment` entity

### Phase 2: SOP Data Import (HIGH PRIORITY)

1. Import all 27 processes with correct codes and executive mapping
2. Import all 14 functions with correct codes and executive mapping
3. Import task data for critical processes (F-EOC, BD, SD, AR)

### Phase 3: UI Restructure (MEDIUM PRIORITY)

1. Redesign navigation to be executive-centric
2. Create Executive Dashboard view
3. Enhance CEO Scorecard (root page) per F-EOC6
4. Add RACI matrix views

### Phase 4: KPI Alignment (MEDIUM PRIORITY)

1. Map existing KPIs to correct processes/executives
2. Add missing KPIs for CEO Scorecard requirements
3. Create rollup KPIs for executive-level health

### Phase 5: Task Management (LOWER PRIORITY)

1. Build task list views per process/function
2. Add task status tracking
3. Implement RACI assignment UI

---

## Part 6: Files to Modify

### Database
- `database/migrations/002_sop_alignment.sql` - New migration for schema changes
- `database/seeds/002_executives.sql` - Executive seed data
- `database/seeds/003_sop_processes.sql` - SOP-aligned process/function data

### Types
- `src/types/index.ts` - Add Executive, Task, RACIAssignment types

### Config
- `src/config/domains.ts` → `src/config/executives.ts` - Restructure

### API
- `src/app/api/executives/` - New executive endpoints
- `src/app/api/tasks/` - New task endpoints
- `src/app/api/kpis/overview/route.ts` - Restructure for executive model

### Components
- `src/components/dashboard/FirmHealthGrid.tsx` - Become CEO Scorecard
- `src/components/dashboard/DomainTile.tsx` → `ExecutiveTile.tsx`
- New: `src/components/raci/RACIMatrix.tsx`
- New: `src/components/tasks/TaskList.tsx`

### Pages
- `src/app/page.tsx` - CEO Scorecard (F-EOC6)
- `src/app/executive/[executiveId]/page.tsx` - Executive domain view
- `src/app/process/[processId]/page.tsx` - Process/Function detail

---

## Part 7: Questions for Stakeholder

Before proceeding with implementation, clarification is needed on:

1. **Scope of Initial Release:** Should we implement all 41 processes/functions, or start with a subset (e.g., CEO functions + critical operational processes)?

2. **Task Granularity:** Should all 200+ tasks be imported, or focus on task definitions without individual tracking?

3. **RACI Data Source:** Is there a spreadsheet or database with current RACI assignments, or should we use SOP document as source of truth?

4. **User Mapping:** How do existing dashboard users map to the executive/staff structure in the SOP?

5. **KPI Data Sources:** Which processes have existing data sources vs. which will need manual entry?

---

## Appendix A: SOP Process/Function Complete List

### CEO Functions (7)
- F-EOC, F-CAI, F-QAD, F-PEM, F-SP, F-CRC, F-CPE

### President Processes (6) + Functions (4)
- Processes: CF, CR, TP, EM, PA, VM
- Functions: F-IP, F-OC, F-ER, F-KM

### COO Processes (9) + Functions (5)
- Processes: OC, WD, TM, ST, EO, ES, ET, PM, TC
- Functions: F-BOM, F-BI, F-BA, F-EH, F-TLG

### CFO Processes (6)
- AR, AP, MC, FR, IM, SM

### CDAO Processes (4) + Functions (1)
- Processes: SA, HMRF, DDD, IM
- Functions: F-IT

### CGO Processes (3)
- BD, TL, MC

### CSO Processes (6) + Functions (1)
- Processes: SD, CP, CC, CiS, CA, CFP
- Functions: F-CDH

---

## Appendix B: CEO Scorecard KPI Mapping (F-EOC6)

| Scorecard Metric | Source Process | KPI Name | Current Status |
|------------------|---------------|----------|----------------|
| Pipeline Health | BD | Active Pipeline Value | ✅ Exists |
| Pipeline Health | BD | Win Rate | ✅ Exists |
| Delivery Health | SD | On-Time Delivery Rate | ✅ Exists |
| Delivery Health | SD | Client Satisfaction | ✅ Exists |
| Margin | CP | Contract Margin | ❌ Needs creation |
| Cash | CF | Cash Position | ❌ Needs creation |
| Cash | AR | Days Sales Outstanding | ✅ Exists |
| Cash | AR | AR 90+ Days | ✅ Exists |
| Staffing Capacity | ST | Billable Utilization | ✅ Exists |
| Staffing Capacity | ST | Open Positions | ❌ Needs creation |
| Strategic Initiatives | F-SP | Initiatives On Track | ⚠️ Generic exists |

---

*This document should be updated as implementation progresses. Next step: Create implementation plan with specific file changes and migration scripts.*
