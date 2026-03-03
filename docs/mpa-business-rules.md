# MPA Business Rules Reference — Current Configuration

**Monthly Performance Analysis Pipeline**\
Third Horizon Executive Dashboard v2.1\
Generated from codebase: `src/lib/mpa/` — March 2026

---

## 1. Input Files — What Gets Pulled

The pipeline ingests 5 Excel files. Each is uploaded through the dashboard and stored in Supabase before processing.

### 1.1 Pro Forma Workbook

**Source:** Excel workbook, sheet named `PRO FORMA 2025`

This is the single source of truth for which projects generate revenue and how much.

**How it's parsed:**

- Finds the header row by scanning the first 10 rows for a sequence containing Jan, Feb, Mar.
- Locates the target month's column by matching the month abbreviation (e.g., "Nov" for November).
- **Column A** = allocation tag. Must be exactly `Data` or `Wellness`. Anything else (blank, other text) is ignored — the project gets no tag.
- **Column B** = project name or section header.
- **Column C** = contract code (the join key across all files).
- **Section headers:** rows where B is filled but C is empty. Sets the current section (e.g., BEH, PAD, MAR).
- **Project rows:** rows where both B and C are filled. Revenue is read from the target month column.

**Duplicate handling:** If the same contract code appears on multiple rows, revenues are summed. However, if the same code appears with both `Data` and `Wellness` tags, the pipeline raises a hard error (conflicting allocation tags).

**Revenue validation:** The sum of all parsed project revenues must match the "Base Revenue" or "Forecasted Revenue" row within $0.01 tolerance. A mismatch halts the pipeline.

> **ADJUSTABLE:** Sheet name is hardcoded as `PRO FORMA 2025`. This will need updating each fiscal year.

### 1.2 Compensation File

**Source:** Excel file (first sheet). The `Last Name` column is the key that links to Harvest Hours.

**Two strategies for determining hourly cost:**

**Strategy A (Preferred):** If a `Base Cost Per Hour` column exists, its value is used directly as the hourly cost. No calculation needed.

**Strategy B (Fallback):** If no hourly rate column exists, the pipeline computes it:

> hourlyCost = monthlyCost ÷ **216.6667**

Where `monthlyCost` is either the `Total` column or the sum of these 7 components:

1. Base Compensation
2. Company Taxes Paid
3. ICHRA Contribution
4. 401k Match
5. Executive Assistant
6. Well Being Card
7. Travel & Expenses

> **ADJUSTABLE:** 216.6667 hours/month is the expected monthly hours constant used for Strategy B conversion. Change this if the firm uses a different standard.

**Constraint:** Last names must be unique. Duplicate last names cause a hard error since Last Name is the join key to Harvest Hours.

### 1.3 Harvest Hours

**Source:** Harvest time tracking export.

**Required columns:** Date, Project Code, Hours, Last Name

**Optional column:** Project / Project Name / Client Name

**Date filtering:** Only rows where the date falls within the target month (first day through last day) are included. Rows outside the month range are excluded and logged.

**Join key:** `Last Name` links each hours row to the Compensation file for hourly cost lookup.

**Missing staff behavior:** Staff members who appear in Harvest Hours but are missing from the Compensation file are entirely excluded — their hours are dropped, not costed at $0. A warning is logged but the pipeline continues.

### 1.4 Harvest Expenses

**Source:** Harvest expense export.

**Required columns:** Date, Project Code, Amount, Billable

**Optional column:** Notes / Description

**Reimbursable filter:**

- Billable = Yes → **EXCLUDED** (client-reimbursable, not a company cost)
- Billable = No → included as a direct expense
- Billable = unknown/blank → treated as non-reimbursable and **included**

> **ADJUSTABLE:** Expenses are not filtered by month like hours are. All non-reimbursable expenses in the file are included regardless of date.

### 1.5 P&L Statement

**Source:** Excel workbook, sheet named `IncomeStatement`. Column A = account name. The "Total" column (or last column) = amount.

**Step 1 — Exclude non-expense lines** (these never enter any pool):

- Income lines containing: sales, fixed fee, recurring revenue, other income, interest income, dividend income
- Summary lines containing: gross profit, net income, net ordinary income, operating income, total income, total expenses, total payroll, total general, total administrative
- Rows starting with "Total - "
- The word "Other" by itself

**Step 2 — Tag each remaining account into one of 4 buckets** (first match wins):

| Bucket | Match Keywords (contains, case-insensitive) | Purpose |
|---|---|---|
| **DATA** | Starset, AWS, Azure, Cloud, Data Center, Software License, Technology, IT Infrastructure | Allocated to Data-tagged projects |
| **WORKPLACE** | Well-being, Wellbeing, Wellness, ICHRA, Health Insurance, Employee Benefits | Allocated to Wellness-tagged projects |
| **NIL** | Depreciation, Amortization, Interest Expense, Income Tax | Excluded from all pools entirely |
| **SGA** | Everything else (default) | Allocated to all revenue centers |

> **ADJUSTABLE:** The P&L tagging keywords above are the full set of rules that determine which overhead pool each account feeds. Accounts that don't match any DATA, WORKPLACE, or NIL keyword automatically go to SGA. Adding or removing keywords here changes how overhead is distributed.

---

## 2. Project Classification Rules

Every contract code from every source file is classified into exactly one of three mutually exclusive categories. Classification determines whether a project receives revenue, contributes to overhead pools, or is tracked as non-revenue activity.

### 2.1 Revenue Center

A project that appears in the Pro Forma workbook. Revenue centers are the projects whose margins we're measuring. They receive overhead allocations and produce the margin report.

**Rule:** If a contract code exists in the Pro Forma, it is a Revenue Center — regardless of whether its revenue for the target month is $0 or positive.

### 2.2 Cost Center

Internal overhead activity. The labor and expense costs of cost centers feed into the overhead pools, which are then allocated across revenue centers.

**Rule:** A code is a Cost Center if it either:

- (a) appears in the hardcoded COST_CENTERS config list (14 codes), OR
- (b) starts with the `THS-` prefix AND is not in the Pro Forma.

**Current cost center codes and their pool assignments:**

| Code | Description | Pool |
|---|---|---|
| THS-25-01-DEV | Business Development | SGA |
| THS-25-01-BAD | Business Administration | SGA |
| THS-25-01-MTG | Internal Meetings | SGA |
| THS-25-01-SAD | Starset Dev Cost | DATA |
| THS-25-01-OOO | Out of Office | SGA |
| THS-25-01-PAD | Personal Administration | SGA |
| THS-25-01-PRO | Professional Development | SGA |
| THS-25-01-SPP | Internal Special Projects | SGA |
| THS-25-01-TEA | Team Building | SGA |
| THS-25-01-COM | Communications | SGA |
| THS-25-01-CSR | Corporate Social Responsibility | SGA |
| HC3 | Health Care Council of Chicago | SGA |
| GEH | Work Place Well-Being Administration | SGA |
| BEH-25-01-APR | Alliance for Addiction Payment Reform | SGA |

> **ADJUSTABLE:** This list and pool assignments are hardcoded. To add, remove, or reassign a cost center, the code must be updated. Any `THS-` code not in this list that also doesn't appear in the Pro Forma is auto-classified as a cost center with pool SGA by default. Currently only THS-25-01-SAD feeds the DATA pool.

### 2.3 Non-Revenue Client

A project that has hours or expenses logged in Harvest but is not a Revenue Center (not in Pro Forma) and not a Cost Center (not in config, doesn't start with `THS-`). These represent client work where no revenue was booked for the month.

Non-revenue clients appear in the output for visibility but do not receive overhead allocations. Their costs are tracked but not included in margin calculations.

### 2.4 Conflict Rule

A contract code **cannot** be both a Revenue Center (in Pro Forma) and a Cost Center (in the config list). If this occurs, the pipeline halts with an error. The conflict must be resolved in the source data.

---

## 3. Category Mapping

Pro Forma section headers (column B, when column C is empty) are mapped to human-readable analysis categories. This determines how projects are grouped in the results view.

| Section Code | Analysis Category |
|---|---|
| BEH | Behavioral Health |
| PAD | Payment Analytics |
| MAR | Market Research |
| WWB | Workplace Well-Being |
| CMH | Community Health |

> **ADJUSTABLE:** If a section header in the Pro Forma doesn't match any of these 5 codes, the project is assigned category "Unknown." New service lines or renamed sections require adding an entry to this mapping.

---

## 4. Direct Cost Computation

### 4.1 Labor Cost

Each Harvest Hours row is joined to the Compensation file by Last Name. For every matched row:

> **laborCost = hours × hourlyCost**

Results are aggregated by contract code to produce project-level totals.

**Missing staff behavior:** If a staff member appears in Harvest Hours but has no corresponding record in the Compensation file, their hours are entirely excluded from cost calculations. They are not costed at $0 — they are dropped. A warning is logged listing the missing staff names and total dropped hours.

**Detail level:** The pipeline also produces a drill-down table with hours and labor cost broken out by contract code + staff member, for per-person analysis.

### 4.2 Expense Cost

Non-reimbursable expenses (filtered during loading per Rule 1.4) are summed by contract code. The total is applied as a direct cost to revenue centers, cost centers, and non-revenue clients alike.

### 4.3 Cost Center Total Cost

> **totalCost = laborCost + expenseCost**

Cost centers have no revenue offset. Their total cost flows into the overhead pools based on their assigned pool (SGA or DATA).

---

## 5. Overhead Pool Calculation

Three overhead pools are assembled from two sources: P&L account buckets (from Rule 1.5) and cost center labor/expense costs (from Rules 2.2 and 4.3). These pools are then allocated to revenue centers in Section 6.

### 5.1 SGA Pool

> **sgaPool = (sum of all SGA-tagged P&L accounts) + (total cost of all SGA-pool cost centers)**

The SGA pool captures general selling, general & administrative overhead from both the income statement and internal time/expense activity.

### 5.2 Data Pool

> **dataPool = (sum of all DATA-tagged P&L accounts) + (total cost of all DATA-pool cost centers)**

Currently only THS-25-01-SAD (Starset Dev Cost) is assigned to the DATA pool from cost centers. All other cost centers feed SGA.

### 5.3 Workplace Pool

> **workplacePool = (sum of all WORKPLACE-tagged P&L accounts)**

> **ADJUSTABLE — Design Decision:** The Workplace pool does NOT include cost center costs — it is fed by P&L accounts only. This differs from SGA and Data pools which include both P&L and cost center costs. If a cost center like GEH (Work Place Well-Being Administration) should feed the Workplace pool instead of SGA, this is a rule change.

### 5.4 NIL Exclusion

P&L accounts tagged NIL (Depreciation, Amortization, Interest Expense, Income Tax) are excluded from all three pools entirely. They do not affect any project's margin. The excluded total is tracked for audit visibility.

---

## 6. Overhead Allocation Rules

Each pool is allocated to revenue centers pro-rata by revenue. The allocation base (which projects receive the allocation) differs by pool type.

### 6.1 SGA Allocation

Spread across **ALL** revenue centers proportional to their revenue:

> **sgaAllocation_i = (revenue_i / totalRevenue) × sgaPool**

Every revenue center receives a share of SGA, regardless of allocation tag.

### 6.2 Data Infrastructure Allocation

Spread **ONLY** across revenue centers tagged `Data` in the Pro Forma:

> **dataAllocation_i = (revenue_i / dataTaggedRevenue) × dataPool** — if tagged "Data"
>
> **dataAllocation_i = 0** — otherwise

### 6.3 Workplace Well-Being Allocation

Spread **ONLY** across revenue centers tagged `Wellness` in the Pro Forma:

> **workplaceAllocation_i = (revenue_i / wellnessTaggedRevenue) × workplacePool** — if tagged "Wellness"
>
> **workplaceAllocation_i = 0** — otherwise

### 6.4 Untagged Projects

> **ADJUSTABLE — Key Design Decision:** Revenue centers without a `Data` or `Wellness` tag in Column A of the Pro Forma receive SGA allocation only. They do NOT receive Data or Workplace overhead. This means untagged projects show higher margins because they bear less overhead — only their share of SGA.

### 6.5 Reconciliation

After allocation, the sum of each allocation column across all revenue centers must equal its pool total within **$0.01** tolerance. If it doesn't reconcile, the pipeline raises a hard error.

---

## 7. Margin Calculation

### 7.1 Per-Project Net Margin

> **marginDollars = revenue − laborCost − expenseCost − sgaAllocation − dataAllocation − workplaceAllocation**

> **marginPercent = (marginDollars / revenue) × 100**

Projects with $0 revenue get 0% margin (no division by zero).

### 7.2 Overall Firm Margin

> **overallMarginPercent = (Σ marginDollars / Σ revenue) × 100**

This is the blended margin across all revenue centers for the month.

---

## 8. Validation Checks

The pipeline runs 5 categories of automated validation after computing all results. Each check produces a PASS, WARN, or FAIL result.

### 8.1 Data Completeness

- **FAIL** — No revenue centers found
- **FAIL** — Compensation data is empty
- **WARN** — Harvest Hours is empty
- **WARN** — Harvest Expenses is empty

### 8.2 Key Integrity

- **FAIL** — Duplicate Last Names in Compensation file
- **WARN** — Staff in Harvest Hours missing from Compensation
- **FAIL** — Contract code appears as both Revenue Center and Cost Center

### 8.3 Pool Reasonableness

- **FAIL** — SGA pool exceeds 2× total revenue (likely P&L extraction error — income or subtotal lines included)
- **WARN** — SGA pool exceeds 1× total revenue (verify this is expected)

> **ADJUSTABLE:** The 2× (fail) and 1× (warn) thresholds for SGA-to-revenue ratio are hardcoded. These can be adjusted if the firm's overhead structure normally exceeds these bounds.

### 8.4 Mathematical Reconciliation

- **FAIL** — Revenue center sum doesn't match Pro Forma total (tolerance: $0.01)
- **FAIL** — SGA allocation column doesn't sum to SGA pool (tolerance: $0.01)
- **FAIL** — Data allocation column doesn't sum to Data pool (tolerance: $0.01)
- **FAIL** — Workplace allocation column doesn't sum to Workplace pool (tolerance: $0.01)

### 8.5 Reasonableness Warnings

- **WARN** — Revenue centers with revenue booked but zero hours logged
- **WARN** — Contract codes with hours logged but not classified as Revenue or Cost Center (non-revenue clients)
- **WARN** — P&L accounts that defaulted to SGA because they didn't match any tagging keyword

---

## Summary of Adjustable Values

| Value | Current Setting | Impact |
|---|---|---|
| Hours per month | 216.6667 | Comp Strategy B hourly rate conversion |
| Reconciliation tolerance | $0.01 | Pool allocation reconciliation checks |
| SGA fail threshold | 2× revenue | Pool reasonableness FAIL trigger |
| SGA warn threshold | 1× revenue | Pool reasonableness WARN trigger |
| Pro Forma sheet name | PRO FORMA 2025 | Which sheet to parse for revenue |
| P&L sheet name | IncomeStatement | Which sheet to parse for overhead accounts |
| Cost center list | 14 codes | Which projects are overhead vs. revenue |
| P&L tagging keywords | 8 DATA, 6 WORKPLACE, 4 NIL | How P&L accounts are sorted into pools |
| Category mapping | 5 sections → categories | Project grouping in results view |
| Allocation tags | Data, Wellness | Which projects receive Data/Workplace overhead |
| Comp components (Strategy B) | 7 column names | What gets summed for monthly compensation |
