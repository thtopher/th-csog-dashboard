# Third Horizon CSOG Dashboard

A Third Horizon–branded, web-based control center for executive and CSOG team members to monitor firm operational health, aligned with the official Third Horizon Standard Operating Procedures.

**Current Version:** v2.0 (January 2026) — Executive-Centric Dashboard with SOP Alignment

## Overview

The dashboard provides an executive-centric view of firm operations:

### CEO Scorecard
Four key performance categories monitored at the firm level:
- **Pipeline Health** — BD pipeline coverage, proposal success rates
- **Delivery Excellence** — Client satisfaction, milestone tracking
- **Financial Discipline** — AR aging, cash position, month-close timing
- **Operational Efficiency** — Harvest compliance, training completion

### Executive Tiles
Each of 7 C-Suite executives has a dedicated view showing:
- **Processes owned** — Operational processes (BD, SD, CF, etc.)
- **Functions governed** — Governance functions (F-EOC, F-SP, F-BC, etc.)
- **RACI Matrix** — 154 tasks with Responsible/Accountable/Consulted/Informed roles
- **Health status** — Real-time gaps requiring attention

### Key Features
- **Hover-over Definitions** — Tooltips explain all 41 process/function codes
- **Click-through Auditability** — See how metrics are calculated, data sources, upload attribution
- **Executive Logins** — 7 executives can log in and upload only their assigned data types
- **SOP-Aligned Structure** — All processes, functions, and tasks mirror the official Third Horizon SOP

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                              │
│         Next.js + React + Tailwind + Recharts                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                    │
│              Next.js API Routes (REST)                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                             │
│                      PostgreSQL                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                   INGESTION LAYER                                   │
│         Excel Parser (Python) → Future: NetSuite, Notion            │
└─────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
th-csog-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/
│   │   │   ├── executives/     # Executive data endpoints
│   │   │   ├── tasks/          # Task management endpoints
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── data/           # Data upload endpoint
│   │   ├── executive/          # Executive detail pages
│   │   ├── upload/             # Data upload page
│   │   ├── login/              # Authentication page
│   │   ├── page.tsx            # Main dashboard (CEO Scorecard + Tiles)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── common/             # CodeTooltip, shared UI
│   │   ├── dashboard/          # CEOScorecard, ExecutiveTile, ScorecardDetailModal
│   │   ├── raci/               # RACIMatrix component
│   │   ├── layout/             # Header, navigation
│   │   └── process/            # KPI visualization
│   ├── config/
│   │   ├── executives.ts       # Executive colors, initials
│   │   ├── processDefinitions.ts  # All 41 process/function codes
│   │   └── uploadTypes.ts      # Upload types with executive permissions
│   ├── contexts/               # AuthContext with executive users
│   ├── lib/                    # Utilities and database
│   └── types/                  # TypeScript definitions
├── database/
│   ├── migrations/             # Schema (incl. 002_sop_alignment.sql)
│   └── seeds/                  # Executive, process, task, RACI data
├── docs/
│   ├── Third_Horizon_SOP.md    # Official SOP documentation
│   └── SOP_ALIGNMENT_ANALYSIS.md  # SOP-to-dashboard mapping
├── scripts/
│   └── ingestion/              # Python data ingestion scripts
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (for production)
- Python 3.10+ (for data ingestion scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/thtopher/th-csog-dashboard.git
cd th-csog-dashboard

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at http://localhost:3000

### Database Setup

```bash
# Create the database
createdb th_csog_dashboard

# Run migrations
psql -d th_csog_dashboard -f database/migrations/001_initial_schema.sql

# Load seed data (optional, for development)
psql -d th_csog_dashboard -f database/seeds/001_initial_data.sql
```

### Data Ingestion Setup

```bash
# Navigate to ingestion scripts
cd scripts/ingestion

# Install Python dependencies
pip install -r requirements.txt

# Run ingestion (example)
python excel_parser.py path/to/harvest_data.xlsx --type excel_harvest --dry-run
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/executives` | GET | All executives with CEO scorecard |
| `/api/executives/[id]` | GET | Executive detail with processes/functions |
| `/api/tasks` | GET | Task data with RACI assignments |
| `/api/kpis/process/[id]` | GET | Process-level KPI detail |
| `/api/data/upload` | POST | Excel file upload with attribution |

## Key Features

### Version 2.0 (Current - January 2026)
- [x] Executive-centric dashboard architecture
- [x] CEO Scorecard with 4 health categories
- [x] 7 Executive tiles with process/function badges
- [x] RACI Matrix for all 154 SOP tasks
- [x] Hover-over tooltips for 41 process/function codes
- [x] Click-through auditability with calculation formulas
- [x] Executive login system with role-based permissions
- [x] SOP documentation integrated (docs/Third_Horizon_SOP.md)
- [x] Database seeds aligned with official SOP
- [ ] Database integration (PostgreSQL)
- [ ] NetSuite/Notion connectors

### Planned Enhancements
- [ ] Real-time data from source systems
- [ ] Threshold alerts for KPI deviations
- [ ] Historical trend analysis
- [ ] Board meeting preparation views
- [ ] Mobile-responsive executive views

## Demo Accounts

The application includes 9 demo accounts for testing (password: `demo` for all):

| Email | Role | Upload Access |
|-------|------|---------------|
| david@thirdhorizon.com | CEO | F-EOC, Strategic Planning data |
| greg@thirdhorizon.com | President | Cash Flow data |
| jordana@thirdhorizon.com | COO | Harvest, Training, Staffing |
| aisha@thirdhorizon.com | CFO | AR, AP, Month-Close |
| chris@thirdhorizon.com | CDAO | Starset, HMRF data |
| cheryl@thirdhorizon.com | CGO | BD Pipeline |
| ashley@thirdhorizon.com | CSO | Delivery, Contracts |
| topher@thirdhorizon.com | Admin | All upload types |
| demo@thirdhorizon.com | Staff | Read-only |

## Excel Templates

See [docs/excel-templates.md](docs/excel-templates.md) for detailed specifications of the Excel file formats used for data upload:
- Harvest Compliance
- Training Status
- Billable Hours

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/th_csog_dashboard

# Authentication (future)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Optional: External APIs (future)
NETSUITE_ACCOUNT_ID=
NETSUITE_TOKEN_ID=
NOTION_API_KEY=
```

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## Deployment

The application is designed for deployment on:
- **Vercel** (recommended for Next.js)
- **Railway** or **Render** (for database)
- **Docker** (self-hosted option)

## Contributing

This is an internal Third Horizon project. For questions or contributions, contact the development team.

## License

Proprietary - Third Horizon Strategies
