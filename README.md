# Third Horizon CSOG Dashboard

A Third Horizon–branded, web-based control center for executive and CSOG team members to monitor firm operational health across all domains.

## Overview

The dashboard aggregates KPIs from across the firm's operational domains:
- **Growth (BD)** – Pipeline status, deals closed, win rates
- **Service Delivery** – Engagement performance, deliverable status
- **Contract Closure** – Closeout procedures, final billing
- **Finance** – Receivables, book closing, financial reporting
- **Internal Operations** – Harvest compliance, training completion
- **Board & CSOG** – Board communications, strategic planning

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                               │
│         Next.js + React + Tailwind + Recharts                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                     │
│              Next.js API Routes (REST)                              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA & STORAGE LAYER                              │
│                      PostgreSQL                                      │
└─────────────────────────────────────────────────────────────────────┘
                                ▲
                                │
┌─────────────────────────────────────────────────────────────────────┐
│                   INGESTION LAYER                                    │
│         Excel Parser (Python) → Future: NetSuite, Notion            │
└─────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
th-csog-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   │   ├── health/         # Health check endpoint
│   │   │   ├── kpis/           # KPI data endpoints
│   │   │   ├── annotations/    # Annotation CRUD
│   │   │   └── data/           # Data upload endpoint
│   │   ├── page.tsx            # Main dashboard page
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── common/             # Shared UI components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── domain/             # Domain detail components
│   │   ├── layout/             # Layout components (Header, etc.)
│   │   └── process/            # Process detail components
│   ├── config/                 # Configuration constants
│   ├── hooks/                  # React hooks
│   ├── lib/                    # Utilities and database
│   │   ├── api/                # API client utilities
│   │   ├── db/                 # Database connection
│   │   └── utils/              # Helper functions
│   └── types/                  # TypeScript type definitions
├── database/
│   ├── migrations/             # SQL migration files
│   └── seeds/                  # Seed data
├── scripts/
│   └── ingestion/              # Python data ingestion scripts
├── docs/                       # Documentation
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
| `/api/kpis/overview` | GET | All domain KPI summaries |
| `/api/kpis/domain/[id]` | GET | Domain-specific KPIs |
| `/api/kpis/process/[id]` | GET | Process-level KPI detail |
| `/api/data/upload` | POST | Excel file upload |
| `/api/annotations` | GET/POST | Annotation CRUD |

## Key Features

### Phase 1 (Current)
- [x] Project scaffolding and architecture
- [x] Database schema design
- [x] API route stubs
- [x] Core UI components
- [x] Excel ingestion parser
- [ ] Database integration
- [ ] Authentication

### Phase 2 (Planned)
- [ ] Full KPI visualizations
- [ ] Domain drill-down views
- [ ] Process navigation
- [ ] Annotation system
- [ ] Role-based access control

### Phase 3 (Future)
- [ ] NetSuite connector
- [ ] Notion connector
- [ ] Automated data refresh
- [ ] Threshold alerts
- [ ] Historical trend analysis

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
