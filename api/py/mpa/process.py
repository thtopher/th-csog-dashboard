"""
Monthly Performance Analysis - Process Endpoint

Vercel Python Function that runs the full MPA analysis pipeline.

POST /api/mpa/process
Body: { "batchId": "uuid" }

The batch must already exist in mpa_analysis_batches with file paths populated.
This function:
1. Downloads files from Supabase Storage
2. Runs the analysis pipeline
3. Saves results to database
4. Updates batch status
"""

import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from io import BytesIO

# Add lib directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
lib_dir = os.path.join(current_dir, 'lib')
if lib_dir not in sys.path:
    sys.path.insert(0, lib_dir)

# Load environment from .env if running locally
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from loaders import (
    ProFormaLoader,
    CompensationLoader,
    HarvestHoursLoader,
    HarvestExpensesLoader,
    PnLLoader,
)
from classification import ProjectClassifier, classify_all_activity
from computations import (
    calculate_labor_costs,
    calculate_expense_costs,
    merge_direct_costs,
    calculate_cost_center_costs,
    calculate_non_revenue_client_costs,
)
from allocations import OverheadAllocator, calculate_margins, get_tagged_revenue
from validators import run_all_validations
from db import SupabaseClient


def run_analysis(db: SupabaseClient, batch: dict) -> dict:
    """
    Run the full MPA analysis pipeline.

    Args:
        db: SupabaseClient instance
        batch: Batch record from database

    Returns:
        Dictionary with analysis results and logs
    """
    batch_id = batch['id']
    month = batch['month_name']
    logs = []

    # Phase 1: Load files
    logs.append(f"Loading files for {month}...")

    proforma_content = db.download_file(batch['proforma_file_path'])
    compensation_content = db.download_file(batch['compensation_file_path'])
    hours_content = db.download_file(batch['hours_file_path'])
    expenses_content = db.download_file(batch['expenses_file_path'])
    pnl_content = db.download_file(batch['pnl_file_path'])

    # Load Pro Forma
    proforma_loader = ProFormaLoader(proforma_content, month)
    proforma_df = proforma_loader.load()
    logs.extend(proforma_loader.logs)

    # Load Compensation
    comp_loader = CompensationLoader(compensation_content)
    comp_df = comp_loader.load()
    logs.extend(comp_loader.logs)

    # Load Hours
    hours_loader = HarvestHoursLoader(hours_content, month)
    hours_df = hours_loader.load()
    logs.extend(hours_loader.logs)

    # Load Expenses
    expenses_loader = HarvestExpensesLoader(expenses_content)
    expenses_df = expenses_loader.load()
    logs.extend(expenses_loader.logs)

    # Load P&L
    pnl_loader = PnLLoader(pnl_content)
    pnl_df = pnl_loader.load()
    logs.extend(pnl_loader.logs)

    logs.append("Files loaded successfully")

    # Phase 2: Classify projects
    logs.append("Classifying projects...")
    classifier = ProjectClassifier()
    classified = classify_all_activity(proforma_df, hours_df, expenses_df, classifier)
    revenue_centers = classified['revenue_centers']
    cost_centers = classified['cost_centers']
    non_revenue_clients = classified['non_revenue_clients']

    logs.append(
        f"Classified: {len(revenue_centers)} revenue centers, "
        f"{len(cost_centers)} cost centers, "
        f"{len(non_revenue_clients)} non-revenue clients"
    )

    # Phase 3: Compute direct costs
    logs.append("Computing direct costs...")
    labor_summary, hours_detail, labor_logs = calculate_labor_costs(hours_df, comp_df)
    logs.extend(labor_logs)

    expense_summary, expense_detail = calculate_expense_costs(expenses_df)

    revenue_centers = merge_direct_costs(revenue_centers, labor_summary, expense_summary)
    cost_centers = calculate_cost_center_costs(cost_centers, hours_detail, expense_detail)
    non_revenue_clients = calculate_non_revenue_client_costs(non_revenue_clients, hours_detail, expense_detail)

    logs.append("Direct costs computed")

    # Phase 4: Allocate overhead
    logs.append("Allocating overhead pools...")
    allocator = OverheadAllocator()
    pools = allocator.calculate_pools(pnl_df, cost_centers, include_cc_in_sga=True)

    revenue_centers = allocator.allocate_sga(revenue_centers, pools['sga_pool'])
    revenue_centers = allocator.allocate_data(revenue_centers, pools['data_pool'])
    revenue_centers = allocator.allocate_workplace(revenue_centers, pools['workplace_pool'])
    revenue_centers = calculate_margins(revenue_centers)

    tagged_revenue = get_tagged_revenue(revenue_centers)

    logs.append(
        f"Pools allocated: SG&A ${pools['sga_pool']:,.2f}, "
        f"Data ${pools['data_pool']:,.2f}, "
        f"Workplace ${pools['workplace_pool']:,.2f}"
    )

    # Phase 5: Validate
    logs.append("Running validation checks...")
    validation_data = {
        'revenue_centers': revenue_centers,
        'cost_centers': cost_centers,
        'non_revenue_clients': non_revenue_clients,
        'proforma': proforma_df,
        'pools': pools,
        'hours': hours_df,
        'expenses': expenses_df,
        'compensation': comp_df,
        'pnl': pnl_df,
    }
    validation_results = run_all_validations(validation_data)
    logs.append(f"Validation: {validation_results.summary()}")

    # Calculate summary metrics
    total_revenue = float(revenue_centers['revenue'].sum())
    total_labor_cost = float(revenue_centers['labor_cost'].sum())
    total_expense_cost = float(revenue_centers['expense_cost'].sum())
    total_margin_dollars = float(revenue_centers['margin_dollars'].sum())
    overall_margin_percent = (total_margin_dollars / total_revenue * 100) if total_revenue > 0 else 0

    summary = {
        'total_revenue': total_revenue,
        'total_labor_cost': total_labor_cost,
        'total_expense_cost': total_expense_cost,
        'total_margin_dollars': total_margin_dollars,
        'overall_margin_percent': overall_margin_percent,
        'sga_pool': pools['sga_pool'],
        'data_pool': pools['data_pool'],
        'workplace_pool': pools['workplace_pool'],
        'revenue_center_count': len(revenue_centers),
        'cost_center_count': len(cost_centers),
        'non_revenue_client_count': len(non_revenue_clients),
    }

    # Phase 6: Save results
    logs.append("Saving results to database...")
    db.save_revenue_centers(batch_id, revenue_centers)
    db.save_cost_centers(batch_id, cost_centers)
    db.save_non_revenue_clients(batch_id, non_revenue_clients)
    db.save_hours_detail(batch_id, hours_detail)
    db.save_expenses_detail(batch_id, expense_detail)
    db.save_pools_detail(batch_id, pools, tagged_revenue)
    db.save_batch_summary(batch_id, summary, validation_results.to_json())

    logs.append("Analysis complete!")

    return {
        'success': True,
        'summary': summary,
        'validation': validation_results.to_json(),
        'logs': logs,
    }


class handler(BaseHTTPRequestHandler):
    """Vercel Python Function handler."""

    def do_POST(self):
        """Handle POST request to run analysis."""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body) if body else {}

            batch_id = data.get('batchId')
            if not batch_id:
                self._send_error(400, "batchId is required")
                return

            # Initialize Supabase client
            db = SupabaseClient()

            # Get batch details
            batch = db.get_batch(batch_id)
            if not batch:
                self._send_error(404, f"Batch {batch_id} not found")
                return

            # Verify all files are present
            required_files = [
                'proforma_file_path',
                'compensation_file_path',
                'hours_file_path',
                'expenses_file_path',
                'pnl_file_path',
            ]
            missing = [f for f in required_files if not batch.get(f)]
            if missing:
                self._send_error(400, f"Missing file paths: {', '.join(missing)}")
                return

            # Update status to processing
            db.update_batch_status(batch_id, 'processing')

            # Run analysis
            result = run_analysis(db, batch)

            # Send success response
            self._send_json(200, result)

        except ValueError as e:
            # Business logic error
            error_msg = str(e)
            try:
                db = SupabaseClient()
                db.update_batch_status(batch_id, 'failed', error_msg)
            except Exception:
                pass
            self._send_error(400, error_msg)

        except Exception as e:
            # Unexpected error
            error_msg = f"Internal error: {str(e)}"
            error_trace = traceback.format_exc()
            print(f"MPA Process Error: {error_trace}")
            try:
                db = SupabaseClient()
                db.update_batch_status(batch_id, 'failed', error_msg)
            except Exception:
                pass
            self._send_error(500, error_msg)

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status: int, data: dict):
        """Send JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, status: int, message: str):
        """Send error response."""
        self._send_json(status, {'success': False, 'error': message})

    def _send_cors_headers(self):
        """Add CORS headers."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
