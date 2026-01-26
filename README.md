# Third Horizon Executive Dashboard

A Next.js web application for executive and CSOG team members to monitor firm operational health, aligned with Third Horizon Standard Operating Procedures.

**Current Version:** v2.1 (January 2026)

## Features

### CEO Scorecard
Four key performance categories monitored at the firm level:
- **Pipeline Health** — BD pipeline coverage, proposal success rates
- **Delivery Excellence** — Client satisfaction, milestone tracking
- **Financial Discipline** — AR aging, cash position, month-close timing
- **Operational Efficiency** — Harvest compliance, training completion

### Executive Views
Each of 7 C-Suite executives has a dedicated dashboard showing:
- Processes owned and functions governed
- RACI Matrix with 154 tasks
- Real-time health status and gaps requiring attention

### Monthly Performance Analysis (MPA)
Project-level margin analysis with overhead allocation:
- Upload 5 source files (Pro Forma, Compensation, Harvest Hours/Expenses, P&L)
- Automatic classification into revenue centers, cost centers, and non-revenue clients
- SG&A, Data, and Workplace overhead pool allocation
- Margin calculations with validation checks
- Drill-down by project and employee

### Upload Management
- Calendar-based upload tracking with compliance status
- Role-based upload permissions per executive
- File storage via Supabase Storage
- Upload history and attribution

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Auth:** NextAuth.js with Azure AD (or demo mode)
- **Charts:** Recharts
- **Excel Parsing:** SheetJS (xlsx)

## Project Structure

```
th-csog-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # NextAuth endpoints
│   │   │   ├── executives/       # Executive data
│   │   │   ├── mpa/              # Monthly Performance Analysis
│   │   │   │   └── batches/      # Batch CRUD and processing
│   │   │   ├── storage/          # File upload to Supabase
│   │   │   └── uploads/          # Upload compliance tracking
│   │   ├── executive/[id]/       # Executive detail pages
│   │   ├── monthly-performance/  # MPA upload wizard and results
│   │   ├── upload/               # Data upload page
│   │   └── page.tsx              # CEO Scorecard
│   ├── components/
│   │   ├── dashboard/            # CEOScorecard, ExecutiveTile
│   │   ├── layout/               # Header, navigation
│   │   ├── monthly-performance/  # MPA components
│   │   ├── timeline/             # Upload calendar
│   │   └── uploads/              # Upload forms
│   ├── config/
│   │   ├── executives.ts         # Executive definitions
│   │   ├── processDefinitions.ts # 41 process/function codes
│   │   └── uploadTypes.ts        # Upload types with permissions
│   ├── contexts/                 # AuthContext
│   ├── lib/
│   │   ├── mpa/                  # MPA processing pipeline
│   │   ├── metrics/              # Metric calculations
│   │   └── supabase/             # Database client
│   └── types/                    # TypeScript definitions
├── database/
│   └── migrations/               # SQL schema migrations
└── public/                       # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (for database and storage)

### Local Development

```bash
# Clone and install
git clone https://github.com/thtopher/th-csog-dashboard.git
cd th-csog-dashboard
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start development server
npm run dev
```

Open http://localhost:3000

### Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor and run migrations in order:
   - `database/migrations/001_initial_schema.sql`
   - `database/migrations/002_sop_alignment.sql`
   - `database/migrations/003_onboarding_uploads.sql`
   - `database/migrations/004_file_storage.sql`
   - `database/migrations/005_monthly_performance_analysis.sql`
3. Create a storage bucket named `uploads`

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXTAUTH_SECRET` | Random string for session encryption |
| `NEXTAUTH_URL` | Your production URL |
| `NEXT_PUBLIC_DEMO_MODE` | Set to `true` for demo login |

For Azure AD authentication (optional):
| Variable | Description |
|----------|-------------|
| `AZURE_AD_CLIENT_ID` | Azure AD application client ID |
| `AZURE_AD_CLIENT_SECRET` | Azure AD client secret |
| `AZURE_AD_TENANT_ID` | Azure AD tenant ID |

## Environment Variables

Create `.env.local` for local development:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Demo Mode (set to true to enable demo login)
NEXT_PUBLIC_DEMO_MODE=true

# Azure AD (optional - for production SSO)
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=
```

## API Endpoints

### Core
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/executives` | GET | All executives with scorecard data |
| `/api/executives/[id]` | GET | Executive detail |
| `/api/metrics` | GET | Dashboard metrics |

### Uploads
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/uploads/compliance` | GET | Upload compliance by period |
| `/api/storage/upload` | POST | Upload file to Supabase Storage |
| `/api/data/upload` | POST | Process uploaded data file |

### Monthly Performance Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mpa/batches` | GET | List MPA batches |
| `/api/mpa/batches` | POST | Create new batch |
| `/api/mpa/batches/[id]` | GET | Get batch details |
| `/api/mpa/batches/[id]` | PATCH | Update batch (file paths) |
| `/api/mpa/batches/[id]/process` | POST | Run analysis pipeline |
| `/api/mpa/batches/[id]/results` | GET | Get analysis results |

## Demo Accounts

When `NEXT_PUBLIC_DEMO_MODE=true`, these accounts are available (password: `demo`):

| Email | Role | Access |
|-------|------|--------|
| david@thirdhorizon.com | CEO | Full dashboard, F-EOC data |
| greg@thirdhorizon.com | President | Cash Flow data |
| jordana@thirdhorizon.com | COO | Harvest, Training, Staffing |
| aisha@thirdhorizon.com | CFO | AR, AP, Month-Close, MPA |
| chris@thirdhorizon.com | CDAO | Starset, HMRF data |
| cheryl@thirdhorizon.com | CGO | BD Pipeline |
| ashley@thirdhorizon.com | CSO | Delivery, Contracts |
| topher@thirdhorizon.com | Admin | All access |
| demo@thirdhorizon.com | Staff | Read-only |

## Development Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run test       # Run tests
npm run test:watch # Watch mode tests
```

## License

Proprietary - Third Horizon Strategies
