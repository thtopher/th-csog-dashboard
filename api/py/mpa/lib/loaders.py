"""
Data Loaders for Monthly Performance Analysis

Loads and validates the 5 source files:
1. Pro Forma (revenue, allocation tags, duplicate aggregation)
2. Compensation (Strategy A: direct read, Strategy B: compute)
3. Harvest Hours (time tracking)
4. Harvest Expenses (with reimbursable filtering)
5. P&L (config-driven account bucketing)

Adapted for Vercel Python Functions - works with BytesIO streams from Supabase Storage.
"""

import pandas as pd
import re
from io import BytesIO
from pathlib import Path
from datetime import datetime
from calendar import monthrange
from typing import Optional, Union, List, Dict, Any


def normalize_contract_code(code: str) -> str:
    """
    Normalize contract code for consistent joins.

    Rules:
    - Trim whitespace
    - Remove non-breaking spaces
    - Preserve case (codes are case-sensitive)
    - Treat empty/missing as invalid
    """
    if pd.isna(code):
        raise ValueError("Contract code is missing")

    normalized = str(code).strip()
    normalized = normalized.replace('\xa0', ' ')
    normalized = ' '.join(normalized.split())

    if not normalized:
        raise ValueError("Contract code is empty after normalization")

    return normalized


def get_config_path(filename: str) -> Path:
    """Get path to config file relative to this module."""
    return Path(__file__).parent.parent.parent / 'config' / filename


class ProFormaLoader:
    """
    Load Pro Forma revenue file.

    v3.0 Requirements:
    - Read Column A for allocation tags (Data/Wellness/blank)
    - Aggregate duplicate contract codes
    - Detect conflict if same code has both Data and Wellness tags
    - Dynamic month column detection
    - Section-based category headers (BEH/PAD/MAR/WWB/CMH)
    """

    def __init__(self, file_content: BytesIO, month: str):
        self.file_content = file_content
        self.month = month
        self.logs: List[str] = []

    def load(self) -> pd.DataFrame:
        """Load Pro Forma file."""
        df = pd.read_excel(self.file_content, sheet_name='PRO FORMA 2025', header=None)

        header_row_idx = self._find_header_row(df)
        header = df.iloc[header_row_idx]
        month_col_idx = self._find_month_column(header, self.month)

        total_revenue_row_idx = self._find_total_revenue_row(df)
        total_revenue = float(df.iloc[total_revenue_row_idx, month_col_idx])

        projects = []
        current_section = None

        for idx in range(header_row_idx + 1, len(df)):
            row = df.iloc[idx]
            col_a = row[0]
            col_b = row[1]
            col_c = row[2]
            revenue_val = row[month_col_idx]

            if pd.isna(col_b) and pd.isna(col_c):
                continue

            if pd.notna(col_b) and pd.isna(col_c):
                current_section = self._extract_section_name(str(col_b))
                continue

            if pd.notna(col_b) and pd.notna(col_c):
                allocation_tag = str(col_a).strip() if pd.notna(col_a) else ''

                projects.append({
                    'contract_code_raw': str(col_c),
                    'project_name': str(col_b).strip(),
                    'proforma_section': current_section,
                    'allocation_tag': allocation_tag if allocation_tag in ['Data', 'Wellness'] else '',
                    'revenue': float(revenue_val) if pd.notna(revenue_val) else 0.0,
                })

        projects_df = pd.DataFrame(projects)
        if projects_df.empty:
            raise ValueError("No projects found in Pro Forma after parsing")

        projects_df['contract_code'] = projects_df['contract_code_raw'].apply(normalize_contract_code)
        aggregated = self._aggregate_duplicates(projects_df)

        category_mapping = self._load_category_mapping()
        aggregated['analysis_category'] = aggregated['proforma_section'].map(category_mapping)
        aggregated['analysis_category'] = aggregated['analysis_category'].fillna('Unknown')

        calculated_total = aggregated['revenue'].sum()
        if abs(calculated_total - total_revenue) > 0.01:
            raise ValueError(
                f"Revenue sum mismatch: calculated ${calculated_total:,.2f} "
                f"vs total ${total_revenue:,.2f} (diff: ${abs(calculated_total - total_revenue):,.2f})"
            )

        self.logs.append(f"Pro Forma: {len(aggregated)} projects, revenue ${total_revenue:,.2f}")
        self.logs.append(
            f"Allocation tags: {sum(aggregated['allocation_tag'] == 'Data')} Data, "
            f"{sum(aggregated['allocation_tag'] == 'Wellness')} Wellness, "
            f"{sum(aggregated['allocation_tag'] == '')} untagged"
        )

        return aggregated[['contract_code', 'project_name', 'proforma_section',
                           'analysis_category', 'allocation_tag', 'revenue']]

    def _find_header_row(self, df: pd.DataFrame) -> int:
        max_scan = min(10, len(df))
        for idx in range(max_scan):
            row_text = ' '.join(df.iloc[idx].astype(str))
            if all(month in row_text for month in ['Jan', 'Feb', 'Mar']):
                return idx
        raise ValueError("Cannot find header row with month sequence (Jan, Feb, Mar)")

    def _find_month_column(self, header: pd.Series, month_name: str) -> int:
        for idx, val in enumerate(header):
            if str(val).strip() == month_name:
                return idx

        month_abbrev = month_name[:3]
        for idx, val in enumerate(header):
            if str(val).strip() == month_abbrev:
                return idx

        for idx, val in enumerate(header):
            if str(val).strip().lower() == month_name.lower():
                return idx

        raise ValueError(f"Cannot find month column for '{month_name}' in header")

    def _find_total_revenue_row(self, df: pd.DataFrame) -> int:
        max_scan = min(20, len(df))
        for idx in range(max_scan):
            col_b_val = str(df.iloc[idx, 1]).lower()
            if 'base revenue' in col_b_val or 'forecasted revenue' in col_b_val:
                return idx
        raise ValueError("Cannot find total revenue row (Base Revenue or Forecasted Revenue)")

    def _extract_section_name(self, text: str) -> str:
        text = text.strip()
        for pattern in ['BEH', 'PAD', 'MAR', 'WWB', 'CMH']:
            if pattern in text.upper():
                return text
        return text

    def _aggregate_duplicates(self, projects_df: pd.DataFrame) -> pd.DataFrame:
        for code in projects_df['contract_code'].unique():
            code_rows = projects_df[projects_df['contract_code'] == code]
            tags = set(code_rows['allocation_tag'].dropna())
            tags.discard('')
            if 'Data' in tags and 'Wellness' in tags:
                raise ValueError(
                    f"Allocation tag conflict for contract code '{code}': "
                    "Found both 'Data' and 'Wellness' tags. Please fix Pro Forma."
                )

        def reconcile_tag(tags):
            tags_set = set(tags.dropna())
            tags_set.discard('')
            if 'Data' in tags_set:
                return 'Data'
            if 'Wellness' in tags_set:
                return 'Wellness'
            return ''

        aggregated = projects_df.groupby('contract_code').agg({
            'project_name': 'first',
            'proforma_section': 'first',
            'allocation_tag': reconcile_tag,
            'revenue': 'sum',
        }).reset_index()

        duplicates_count = len(projects_df) - len(aggregated)
        if duplicates_count > 0:
            self.logs.append(f"Aggregated {duplicates_count} duplicate contract codes")

        return aggregated

    def _load_category_mapping(self) -> dict:
        mapping_df = pd.read_csv(get_config_path('category_mapping.csv'))
        return dict(zip(mapping_df['pro_forma_category'], mapping_df['analysis_category']))


class CompensationLoader:
    """
    Load Compensation file with dual strategy.

    v3.0 Requirements:
    - Strategy A (Preferred): Read 'Base Cost Per Hour' directly
    - Strategy B (Fallback): Compute from Total or components
    - Expected hours per month: 216.67
    - Unique Last Name validation (FAIL if duplicates)
    """

    def __init__(self, file_content: BytesIO):
        self.file_content = file_content
        self.expected_hours_per_month = 216.6667
        self.logs: List[str] = []

    def load(self) -> pd.DataFrame:
        df = pd.read_excel(self.file_content)

        base_cost_col = self._find_column(df, ['Base Cost Per Hour', 'Base Cost/Hour', 'Hourly Cost'])
        if base_cost_col:
            self.logs.append(f"Strategy A: Read '{base_cost_col}' directly")
            result = self._load_strategy_a(df, base_cost_col)
        else:
            self.logs.append("Strategy B: Computing hourly cost from components")
            result = self._load_strategy_b(df)

        duplicates = result[result['staff_key'].duplicated()]
        if len(duplicates) > 0:
            dup_names = ', '.join(duplicates['staff_key'].tolist())
            raise ValueError(
                f"Duplicate Last Names found in Compensation file: {dup_names}. "
                "Cannot use Last Name as unique key."
            )

        self.logs.append(f"{len(result)} staff members, avg ${result['hourly_cost'].mean():.2f}/hr")
        return result

    def _load_strategy_a(self, df: pd.DataFrame, cost_col: str) -> pd.DataFrame:
        last_name_col = self._find_column(df, ['Last Name', 'LastName'], required=True)
        return pd.DataFrame({
            'staff_key': df[last_name_col].astype(str).str.strip(),
            'hourly_cost': pd.to_numeric(df[cost_col], errors='coerce'),
            'strategy_used': 'A',
        })

    def _load_strategy_b(self, df: pd.DataFrame) -> pd.DataFrame:
        last_name_col = self._find_column(df, ['Last Name', 'LastName'], required=True)

        total_col = self._find_column(df, ['Total', 'Total Compensation', 'Monthly Total'])
        if total_col:
            monthly_cost = pd.to_numeric(df[total_col], errors='coerce')
        else:
            components = {
                'base': self._find_column(df, ['Base Compensation', 'Base', 'Base Comp'], required=True),
                'taxes': self._find_column(df, ['Company Taxes Paid', 'Taxes', 'Company Taxes'], required=True),
                'ichra': self._find_column(df, ['ICHRA Contribution', 'ICHRA'], required=True),
                'k401': self._find_column(df, ['401k Match', '401k', '401K Match'], required=True),
                'assistant': self._find_column(df, ['Executive Assistant', 'Assistant', 'Exec Assistant'], required=True),
                'wellbeing': self._find_column(df, ['Well Being Card', 'Wellbeing', 'Well-being'], required=True),
                'travel': self._find_column(df, ['Travel & Expenses', 'Travel', 'Travel and Expenses'], required=True),
            }
            monthly_cost = sum(pd.to_numeric(df[col], errors='coerce') for col in components.values())

        hourly_cost = monthly_cost / self.expected_hours_per_month
        return pd.DataFrame({
            'staff_key': df[last_name_col].astype(str).str.strip(),
            'hourly_cost': hourly_cost,
            'strategy_used': 'B',
        })

    def _find_column(self, df: pd.DataFrame, candidates: list, required: bool = False) -> Optional[str]:
        for candidate in candidates:
            for col in df.columns:
                if str(col).strip().lower() == candidate.lower():
                    return col
        if required:
            raise ValueError(f"Required column not found. Tried: {candidates}")
        return None


class HarvestHoursLoader:
    """Load Harvest Hours time tracking file."""

    def __init__(self, file_content: BytesIO, month: str):
        self.file_content = file_content
        self.month = month
        self.logs: List[str] = []

    def load(self) -> pd.DataFrame:
        df = pd.read_excel(self.file_content)

        date_col = self._find_column(df, ['Date', 'Spent Date', 'Work Date'], required=True)
        code_col = self._find_column(df, ['Project Code', 'Project', 'Code'], required=True)
        hours_col = self._find_column(df, ['Hours', 'Hours (h)', 'Hours (decimal)'], required=True)
        name_col = self._find_column(df, ['Last Name', 'LastName', 'Person'], required=True)
        project_col = self._find_column(df, ['Project', 'Project Name', 'Client', 'Client Name'], required=False)

        result = pd.DataFrame({
            'date': pd.to_datetime(df[date_col]),
            'contract_code': df[code_col].astype(str).apply(normalize_contract_code),
            'staff_key': df[name_col].astype(str).str.strip(),
            'hours': pd.to_numeric(df[hours_col], errors='coerce'),
        })

        if project_col:
            result['project_name'] = df[project_col].astype(str).str.strip()

        month_start, month_end = self._get_month_range(self.month)
        outside_month = result[(result['date'] < month_start) | (result['date'] > month_end)]
        if len(outside_month) > 0:
            self.logs.append(f"{len(outside_month)} Harvest Hours rows outside month range (excluded)")
            result = result[(result['date'] >= month_start) & (result['date'] <= month_end)]

        self.logs.append(f"Harvest Hours: {len(result)} rows, {result['hours'].sum():.1f} total hours")
        return result

    def _find_column(self, df: pd.DataFrame, candidates: list, required: bool = False) -> Optional[str]:
        for candidate in candidates:
            for col in df.columns:
                if str(col).strip().lower() == candidate.lower():
                    return col
        if required:
            raise ValueError(f"Required column not found. Tried: {candidates}")
        return None

    def _get_month_range(self, month: str) -> tuple:
        m = re.match(r"([A-Za-z]+)(\d{4})", month)
        if not m:
            raise ValueError(f"Invalid month format: {month}. Expected e.g. 'November2025'")
        month_name, year_str = m.groups()
        year = int(year_str)
        try:
            dt = datetime.strptime(month_name, "%B")
            month_num = dt.month
        except ValueError:
            try:
                dt = datetime.strptime(month_name[:3], "%b")
                month_num = dt.month
            except ValueError:
                raise ValueError(f"Invalid month name: {month_name}")

        start = datetime(year, month_num, 1)
        end = datetime(year, month_num, monthrange(year, month_num)[1])
        return start, end


class HarvestExpensesLoader:
    """
    Load Harvest Expenses file with reimbursable filtering.

    v3.0 Requirements:
    - Filter by Billable column
    - Billable = Yes -> exclude (reimbursable)
    - Billable = No -> include (non-reimbursable)
    - Billable = blank -> warn + include (conservative)
    """

    def __init__(self, file_content: BytesIO):
        self.file_content = file_content
        self.logs: List[str] = []

    def load(self) -> pd.DataFrame:
        df = pd.read_excel(self.file_content)

        date_col = self._find_column(df, ['Date', 'Spent Date', 'Expense Date'], required=True)
        code_col = self._find_column(df, ['Project Code', 'Project', 'Code'], required=True)
        amount_col = self._find_column(df, ['Amount', 'Total Amount', 'Amount (USD)'], required=True)
        billable_col = self._find_column(df, ['Billable', 'Is Billable', 'Billable?'], required=True)
        notes_col = self._find_column(df, ['Notes', 'Description', 'Note', 'Memo'], required=False)

        base = pd.DataFrame({
            'date': pd.to_datetime(df[date_col]),
            'contract_code': df[code_col].astype(str).apply(normalize_contract_code),
            'amount': pd.to_numeric(df[amount_col], errors='coerce').fillna(0.0),
            'billable': df[billable_col],
        })

        if notes_col:
            base['notes'] = df[notes_col].astype(str).fillna('')
        else:
            base['notes'] = ''

        def parse_billable(v):
            if pd.isna(v):
                return None
            s = str(v).strip().lower()
            if s in ['yes', 'y', 'true', '1']:
                return True
            if s in ['no', 'n', 'false', '0']:
                return False
            return None

        base['billable_bool'] = base['billable'].apply(parse_billable)

        reimbursable = base[base['billable_bool'] == True]
        non_reimbursable = base[base['billable_bool'] == False]
        unknown = base[base['billable_bool'].isna()]

        if len(unknown) > 0:
            self.logs.append(f"{len(unknown)} expenses have unknown Billable value (included as non-reimbursable)")

        included = pd.concat([non_reimbursable, unknown], ignore_index=True)
        excluded_count = len(reimbursable)
        if excluded_count > 0:
            self.logs.append(f"Excluded {excluded_count} reimbursable expenses (Billable=Yes)")

        out = included[['date', 'contract_code', 'amount', 'notes']].copy()
        out['was_reimbursable'] = False
        return out

    def _find_column(self, df: pd.DataFrame, candidates: list, required: bool = False) -> Optional[str]:
        for candidate in candidates:
            for col in df.columns:
                if str(col).strip().lower() == candidate.lower():
                    return col
        if required:
            raise ValueError(f"Required column not found. Tried: {candidates}")
        return None


class PnLLoader:
    """
    Load P&L file with config-driven account bucketing.

    v3.0 Requirements:
    - Read IncomeStatement sheet
    - Identify Total column
    - Apply config/pnl_account_tags.csv for bucketing
    - Buckets: DATA, WORKPLACE, NIL, SGA (default)
    """

    def __init__(self, file_content: BytesIO):
        self.file_content = file_content
        self.logs: List[str] = []

    def load(self) -> pd.DataFrame:
        df = pd.read_excel(self.file_content, sheet_name='IncomeStatement', header=0)

        total_col_idx = self._find_total_column(df)
        tags_config = pd.read_csv(get_config_path('pnl_account_tags.csv'))

        results = []
        unmatched = []
        excluded = []

        for idx, row in df.iterrows():
            account_name = str(row.iloc[0]).strip()
            amount = row.iloc[total_col_idx]

            if pd.isna(amount):
                continue
            try:
                amount_float = float(amount)
            except (ValueError, TypeError):
                continue

            if amount_float == 0:
                continue

            if self._should_exclude_pnl_line(account_name):
                excluded.append(account_name)
                continue

            bucket, matched_by = self._match_account(account_name, tags_config)
            if bucket == 'SGA' and matched_by == 'default':
                unmatched.append(account_name)

            results.append({
                'account_name': account_name,
                'amount': amount_float,
                'bucket': bucket,
                'matched_by': matched_by,
            })

        result = pd.DataFrame(results)

        if excluded:
            self.logs.append(f"Excluded {len(excluded)} income/subtotal lines from overhead pools")

        if unmatched:
            self.logs.append(f"{len(unmatched)} P&L accounts defaulted to SG&A (unmatched)")

        for bucket in ['DATA', 'WORKPLACE', 'NIL', 'SGA']:
            bucket_total = result[result['bucket'] == bucket]['amount'].sum()
            bucket_count = len(result[result['bucket'] == bucket])
            self.logs.append(f"{bucket}: ${bucket_total:,.2f} ({bucket_count} accounts)")

        return result

    def _find_total_column(self, df: pd.DataFrame) -> int:
        for idx, col in enumerate(df.columns):
            if 'total' in str(col).lower():
                return idx
        for idx in range(len(df.columns) - 1, -1, -1):
            try:
                sample = pd.to_numeric(df.iloc[:10, idx], errors='coerce')
                if sample.notna().any():
                    return idx
            except Exception:
                continue
        raise ValueError("Cannot find Total column in P&L")

    def _match_account(self, account_name: str, config: pd.DataFrame) -> tuple:
        for _, rule in config.iterrows():
            match_type = rule['match_type']
            pattern = rule['pattern']
            bucket = rule['bucket']

            if match_type == 'exact':
                if account_name == pattern:
                    return bucket, 'exact'
            elif match_type == 'contains':
                if str(pattern).lower() in account_name.lower():
                    return bucket, 'contains'
            elif match_type == 'regex':
                if re.search(pattern, account_name, re.IGNORECASE):
                    return bucket, 'regex'
        return 'SGA', 'default'

    def _should_exclude_pnl_line(self, account_name: str) -> bool:
        account_lower = account_name.lower()

        if account_name.startswith('Total - ') or account_name.startswith('Total -'):
            return True

        income_keywords = [
            'sales',
            'fixed fee',
            'recurring revenue',
            'other income',
            'interest income',
            'dividend income',
        ]
        for keyword in income_keywords:
            if keyword in account_lower:
                return True

        if account_name.strip().lower() == 'other':
            return True

        summary_lines = [
            'gross profit',
            'net income',
            'net ordinary income',
            'operating income',
            'total income',
            'total expenses',
            'total expense',
            'total payroll',
            'total general',
            'total administrative',
        ]
        for summary in summary_lines:
            if summary in account_lower:
                return True

        return False
