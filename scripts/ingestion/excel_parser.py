"""
Third Horizon CSOG Dashboard
Excel Data Ingestion Pipeline

This module handles parsing and validation of Excel files
for KPI data ingestion into the dashboard.
"""

import os
import sys
import hashlib
import logging
from datetime import datetime, date
from pathlib import Path
from typing import Any, Optional
from dataclasses import dataclass, field

# Note: Requires openpyxl: pip install openpyxl pandas

try:
    import pandas as pd
    from openpyxl import load_workbook
except ImportError:
    print("Required packages not installed. Run:")
    print("  pip install pandas openpyxl")
    sys.exit(1)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ValidationError:
    """Represents a validation error or warning"""
    row: Optional[int]
    column: Optional[str]
    message: str
    severity: str = "error"  # "error" or "warning"


@dataclass
class IngestionResult:
    """Result of an ingestion operation"""
    success: bool
    source_type: str
    source_name: str
    file_path: str
    file_hash: str
    row_count: int = 0
    records_created: int = 0
    records_updated: int = 0
    records_skipped: int = 0
    errors: list[ValidationError] = field(default_factory=list)
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


# ============================================
# TEMPLATE DEFINITIONS
# ============================================

HARVEST_TEMPLATE = {
    "name": "harvest_compliance",
    "required_columns": [
        "week_ending",
        "employee_name",
        "hours_logged",
        "hours_expected",
        "compliance_status",
    ],
    "column_types": {
        "week_ending": "date",
        "employee_name": "string",
        "hours_logged": "float",
        "hours_expected": "float",
        "compliance_status": "enum:full,partial,missing",
    },
}

TRAINING_TEMPLATE = {
    "name": "training_status",
    "required_columns": [
        "employee_name",
        "training_type",
        "completion_status",
        "completion_date",
    ],
    "column_types": {
        "employee_name": "string",
        "training_type": "string",
        "completion_status": "enum:completed,in_progress,not_started",
        "completion_date": "date",
    },
}

BILLABLE_TEMPLATE = {
    "name": "billable_hours",
    "required_columns": [
        "week_ending",
        "employee_name",
        "engagement_name",
        "hours_billed",
        "hours_target",
    ],
    "column_types": {
        "week_ending": "date",
        "employee_name": "string",
        "engagement_name": "string",
        "hours_billed": "float",
        "hours_target": "float",
    },
}

TEMPLATES = {
    "excel_harvest": HARVEST_TEMPLATE,
    "excel_training": TRAINING_TEMPLATE,
    "excel_billable": BILLABLE_TEMPLATE,
}


# ============================================
# CORE PARSER
# ============================================

class ExcelParser:
    """Parser for Third Horizon Excel templates"""

    def __init__(self, template_name: str):
        if template_name not in TEMPLATES:
            raise ValueError(f"Unknown template: {template_name}")
        self.template = TEMPLATES[template_name]
        self.template_name = template_name

    def parse(self, file_path: str) -> tuple[pd.DataFrame, list[ValidationError]]:
        """
        Parse an Excel file according to the template.
        Returns (DataFrame, list of validation errors)
        """
        errors: list[ValidationError] = []

        # Check file exists
        if not os.path.exists(file_path):
            errors.append(ValidationError(
                row=None, column=None,
                message=f"File not found: {file_path}"
            ))
            return pd.DataFrame(), errors

        # Load the workbook
        try:
            df = pd.read_excel(file_path, engine="openpyxl")
        except Exception as e:
            errors.append(ValidationError(
                row=None, column=None,
                message=f"Failed to read Excel file: {str(e)}"
            ))
            return pd.DataFrame(), errors

        # Normalize column names
        df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]

        # Validate required columns
        missing_cols = set(self.template["required_columns"]) - set(df.columns)
        if missing_cols:
            errors.append(ValidationError(
                row=None, column=None,
                message=f"Missing required columns: {', '.join(missing_cols)}"
            ))
            return pd.DataFrame(), errors

        # Validate column types and values
        for col, col_type in self.template["column_types"].items():
            if col not in df.columns:
                continue

            col_errors = self._validate_column(df, col, col_type)
            errors.extend(col_errors)

        return df, errors

    def _validate_column(
        self, df: pd.DataFrame, column: str, col_type: str
    ) -> list[ValidationError]:
        """Validate a single column against its expected type"""
        errors = []

        if col_type == "date":
            try:
                df[column] = pd.to_datetime(df[column])
            except Exception:
                errors.append(ValidationError(
                    row=None, column=column,
                    message=f"Column '{column}' contains invalid date values"
                ))

        elif col_type == "float":
            non_numeric = df[~df[column].apply(lambda x: isinstance(x, (int, float)) or pd.isna(x))]
            if len(non_numeric) > 0:
                errors.append(ValidationError(
                    row=None, column=column,
                    message=f"Column '{column}' contains non-numeric values"
                ))

        elif col_type == "string":
            # Strings are generally permissive
            pass

        elif col_type.startswith("enum:"):
            valid_values = col_type.split(":")[1].split(",")
            invalid = df[~df[column].isin(valid_values) & ~df[column].isna()]
            if len(invalid) > 0:
                errors.append(ValidationError(
                    row=None, column=column,
                    message=f"Column '{column}' contains invalid values. Expected: {', '.join(valid_values)}"
                ))

        return errors


# ============================================
# KPI TRANSFORMERS
# ============================================

def transform_harvest_to_kpis(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Transform Harvest compliance data into KPI values.
    Aggregates by week to produce compliance rate KPI.
    """
    kpi_values = []

    # Group by week
    for week_ending, group in df.groupby("week_ending"):
        total_employees = len(group)
        compliant = len(group[group["compliance_status"] == "full"])
        compliance_rate = (compliant / total_employees * 100) if total_employees > 0 else 0

        # Individual breakdown for metadata
        by_status = group["compliance_status"].value_counts().to_dict()

        kpi_values.append({
            "kpi_definition_id": "k1000000-0000-0000-0000-000000000001",  # Harvest Compliance Rate
            "period_start": week_ending - pd.Timedelta(days=6),
            "period_end": week_ending,
            "period_type": "week",
            "value": round(compliance_rate, 1),
            "numerator": compliant,
            "denominator": total_employees,
            "metadata": {
                "by_status": by_status,
                "employees": group["employee_name"].tolist(),
            },
        })

    return kpi_values


def transform_training_to_kpis(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Transform training status data into KPI values.
    Produces completion rate by training type.
    """
    kpi_values = []
    today = date.today()
    month_start = today.replace(day=1)

    # Group by training type
    for training_type, group in df.groupby("training_type"):
        total = len(group)
        completed = len(group[group["completion_status"] == "completed"])
        completion_rate = (completed / total * 100) if total > 0 else 0

        # Determine KPI definition based on training type
        kpi_id = None
        if "harassment" in training_type.lower():
            kpi_id = "k2000000-0000-0000-0000-000000000001"
        elif "cyber" in training_type.lower():
            kpi_id = "k2000000-0000-0000-0000-000000000002"

        if kpi_id:
            kpi_values.append({
                "kpi_definition_id": kpi_id,
                "period_start": month_start,
                "period_end": today,
                "period_type": "month",
                "value": round(completion_rate, 1),
                "numerator": completed,
                "denominator": total,
                "metadata": {
                    "by_status": group["completion_status"].value_counts().to_dict(),
                },
            })

    return kpi_values


# ============================================
# MAIN INGESTION FUNCTION
# ============================================

def ingest_excel(
    file_path: str,
    source_type: str,
    dry_run: bool = False
) -> IngestionResult:
    """
    Main entry point for Excel file ingestion.

    Args:
        file_path: Path to the Excel file
        source_type: One of 'excel_harvest', 'excel_training', 'excel_billable'
        dry_run: If True, validate only without persisting

    Returns:
        IngestionResult with status and any errors
    """
    result = IngestionResult(
        success=False,
        source_type=source_type,
        source_name=TEMPLATES.get(source_type, {}).get("name", "unknown"),
        file_path=file_path,
        file_hash=compute_file_hash(file_path) if os.path.exists(file_path) else "",
    )

    # Parse the file
    parser = ExcelParser(source_type)
    df, errors = parser.parse(file_path)
    result.errors = errors

    if errors and any(e.severity == "error" for e in errors):
        result.completed_at = datetime.now()
        return result

    result.row_count = len(df)

    # Transform to KPI values
    if source_type == "excel_harvest":
        kpi_values = transform_harvest_to_kpis(df)
    elif source_type == "excel_training":
        kpi_values = transform_training_to_kpis(df)
    else:
        kpi_values = []
        result.errors.append(ValidationError(
            row=None, column=None,
            message=f"Transformer not implemented for {source_type}",
            severity="warning"
        ))

    if dry_run:
        logger.info(f"Dry run: Would create {len(kpi_values)} KPI records")
        result.records_created = len(kpi_values)
        result.success = True
        result.completed_at = datetime.now()
        return result

    # TODO: Persist to database
    # For now, just log what we would do
    logger.info(f"Would persist {len(kpi_values)} KPI records to database")
    for kv in kpi_values:
        logger.info(f"  - {kv['period_start']} to {kv['period_end']}: {kv['value']}")

    result.records_created = len(kpi_values)
    result.success = True
    result.completed_at = datetime.now()

    return result


def compute_file_hash(file_path: str) -> str:
    """Compute SHA-256 hash of a file for deduplication"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256.update(block)
    return sha256.hexdigest()


# ============================================
# CLI
# ============================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Third Horizon Excel Data Ingestion"
    )
    parser.add_argument("file", help="Path to Excel file")
    parser.add_argument(
        "--type",
        choices=["excel_harvest", "excel_training", "excel_billable"],
        required=True,
        help="Type of data file"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate without persisting"
    )

    args = parser.parse_args()

    result = ingest_excel(args.file, args.type, dry_run=args.dry_run)

    print(f"\nIngestion Result:")
    print(f"  Success: {result.success}")
    print(f"  Rows: {result.row_count}")
    print(f"  Records created: {result.records_created}")
    if result.errors:
        print(f"  Errors:")
        for err in result.errors:
            print(f"    [{err.severity}] {err.message}")
