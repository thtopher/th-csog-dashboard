"""
Supabase Database Operations for Monthly Performance Analysis

Handles:
- Downloading files from Supabase Storage
- Saving analysis results to database tables
"""

import os
from io import BytesIO
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd

try:
    from supabase import create_client, Client
except ImportError:
    # For local development without supabase package
    Client = None
    create_client = None


class SupabaseClient:
    """
    Supabase client for MPA operations.

    Handles file downloads from storage and database operations.
    """

    def __init__(self):
        self.url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
        self.key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

        if not self.url or not self.key:
            raise ValueError(
                "Supabase not configured. "
                "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
            )

        if create_client is None:
            raise ImportError("supabase package not installed. Run: pip install supabase")

        self.client: Client = create_client(self.url, self.key)
        self.bucket = 'uploads'

    def download_file(self, path: str) -> BytesIO:
        """
        Download a file from Supabase Storage.

        Args:
            path: File path in storage (e.g., 'mpa_proforma/2026-01-26T12-00-00_file.xlsx')

        Returns:
            BytesIO stream of file contents
        """
        response = self.client.storage.from_(self.bucket).download(path)
        return BytesIO(response)

    def update_batch_status(
        self,
        batch_id: str,
        status: str,
        error_message: Optional[str] = None
    ):
        """Update batch status."""
        data = {
            'status': status,
            'updated_at': datetime.utcnow().isoformat(),
        }
        if error_message:
            data['error_message'] = error_message
        if status == 'completed':
            data['processed_at'] = datetime.utcnow().isoformat()

        self.client.table('mpa_analysis_batches').update(data).eq('id', batch_id).execute()

    def save_batch_summary(
        self,
        batch_id: str,
        summary: Dict[str, Any],
        validation_results: List[Dict[str, str]]
    ):
        """
        Save batch summary metrics and validation results.

        Args:
            batch_id: Batch UUID
            summary: Dictionary with summary metrics
            validation_results: List of validation items [{type, message}]
        """
        validation_passed = not any(v['type'] == 'fail' for v in validation_results)

        data = {
            'total_revenue': summary.get('total_revenue'),
            'total_labor_cost': summary.get('total_labor_cost'),
            'total_expense_cost': summary.get('total_expense_cost'),
            'total_margin_dollars': summary.get('total_margin_dollars'),
            'overall_margin_percent': summary.get('overall_margin_percent'),
            'sga_pool': summary.get('sga_pool'),
            'data_pool': summary.get('data_pool'),
            'workplace_pool': summary.get('workplace_pool'),
            'revenue_center_count': summary.get('revenue_center_count', 0),
            'cost_center_count': summary.get('cost_center_count', 0),
            'non_revenue_client_count': summary.get('non_revenue_client_count', 0),
            'validation_passed': validation_passed,
            'validation_errors': validation_results,
            'status': 'completed',
            'processed_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }

        self.client.table('mpa_analysis_batches').update(data).eq('id', batch_id).execute()

    def save_revenue_centers(self, batch_id: str, df: pd.DataFrame):
        """Save revenue centers to database."""
        if df.empty:
            return

        records = []
        for _, row in df.iterrows():
            records.append({
                'batch_id': batch_id,
                'contract_code': str(row['contract_code']),
                'project_name': str(row.get('project_name', '')) or None,
                'proforma_section': str(row.get('proforma_section', '')) or None,
                'analysis_category': str(row.get('analysis_category', '')) or None,
                'allocation_tag': str(row.get('allocation_tag', '')) or None,
                'revenue': float(row.get('revenue', 0)),
                'hours': float(row.get('hours', 0)),
                'labor_cost': float(row.get('labor_cost', 0)),
                'expense_cost': float(row.get('expense_cost', 0)),
                'sga_allocation': float(row.get('sga_allocation', 0)),
                'data_allocation': float(row.get('data_allocation', 0)),
                'workplace_allocation': float(row.get('workplace_allocation', 0)),
                'margin_dollars': float(row.get('margin_dollars', 0)),
                'margin_percent': float(row.get('margin_percent', 0)),
            })

        self.client.table('mpa_revenue_centers').insert(records).execute()

    def save_cost_centers(self, batch_id: str, df: pd.DataFrame):
        """Save cost centers to database."""
        if df.empty:
            return

        records = []
        for _, row in df.iterrows():
            records.append({
                'batch_id': batch_id,
                'contract_code': str(row['contract_code']),
                'description': str(row.get('description', '')) or None,
                'pool': str(row.get('pool', 'SGA')),
                'hours': float(row.get('hours', 0)),
                'labor_cost': float(row.get('labor_cost', 0)),
                'expense_cost': float(row.get('expense_cost', 0)),
                'total_cost': float(row.get('total_cost', 0)),
            })

        self.client.table('mpa_cost_centers').insert(records).execute()

    def save_non_revenue_clients(self, batch_id: str, df: pd.DataFrame):
        """Save non-revenue clients to database."""
        if df.empty:
            return

        records = []
        for _, row in df.iterrows():
            records.append({
                'batch_id': batch_id,
                'contract_code': str(row['contract_code']),
                'project_name': str(row.get('project_name', '')) or None,
                'hours': float(row.get('hours', 0)),
                'labor_cost': float(row.get('labor_cost', 0)),
                'expense_cost': float(row.get('expense_cost', 0)),
                'total_cost': float(row.get('total_cost', 0)),
            })

        self.client.table('mpa_non_revenue_clients').insert(records).execute()

    def save_hours_detail(self, batch_id: str, df: pd.DataFrame):
        """Save hours detail for drill-down."""
        if df.empty:
            return

        records = []
        for _, row in df.iterrows():
            records.append({
                'batch_id': batch_id,
                'contract_code': str(row['contract_code']),
                'staff_key': str(row['staff_key']),
                'hours': float(row.get('hours', 0)),
                'hourly_cost': float(row.get('hourly_cost', 0)),
                'labor_cost': float(row.get('labor_cost', 0)),
            })

        # Insert in batches to avoid payload limits
        batch_size = 500
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self.client.table('mpa_hours_detail').insert(batch).execute()

    def save_expenses_detail(self, batch_id: str, df: pd.DataFrame):
        """Save expenses detail for drill-down."""
        if df.empty:
            return

        records = []
        for _, row in df.iterrows():
            expense_date = None
            if pd.notna(row.get('expense_date')):
                expense_date = pd.to_datetime(row['expense_date']).strftime('%Y-%m-%d')

            records.append({
                'batch_id': batch_id,
                'contract_code': str(row['contract_code']),
                'expense_date': expense_date,
                'amount': float(row.get('amount', 0)),
                'notes': str(row.get('notes', '')) or None,
            })

        # Insert in batches
        batch_size = 500
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self.client.table('mpa_expenses_detail').insert(batch).execute()

    def save_pools_detail(self, batch_id: str, pools: Dict[str, float], tagged_revenue: Dict[str, float]):
        """Save pools detail for audit trail."""
        record = {
            'batch_id': batch_id,
            'sga_from_pnl': float(pools.get('sga_from_pnl', 0)),
            'data_from_pnl': float(pools.get('data_from_pnl', 0)),
            'workplace_from_pnl': float(pools.get('workplace_from_pnl', 0)),
            'nil_excluded': float(pools.get('nil_excluded', 0)),
            'sga_from_cc': float(pools.get('sga_from_cc', 0)),
            'data_from_cc': float(pools.get('data_from_cc', 0)),
            'total_revenue': float(tagged_revenue.get('total_revenue', 0)),
            'data_tagged_revenue': float(tagged_revenue.get('data_tagged_revenue', 0)),
            'wellness_tagged_revenue': float(tagged_revenue.get('wellness_tagged_revenue', 0)),
        }

        self.client.table('mpa_pools_detail').insert(record).execute()

    def get_batch(self, batch_id: str) -> Optional[Dict[str, Any]]:
        """Get batch details by ID."""
        response = self.client.table('mpa_analysis_batches').select('*').eq('id', batch_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
