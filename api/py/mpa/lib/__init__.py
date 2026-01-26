"""
Monthly Performance Analysis - Core Library

Adapted from TH Monthly Performance Analysis Flask app for Vercel Python Functions.
"""

from .loaders import (
    normalize_contract_code,
    ProFormaLoader,
    CompensationLoader,
    HarvestHoursLoader,
    HarvestExpensesLoader,
    PnLLoader,
)
from .classification import ProjectClassifier, classify_all_activity
from .computations import calculate_labor_costs, calculate_expense_costs, merge_direct_costs
from .allocations import OverheadAllocator, calculate_margins
from .validators import run_all_validations, ValidationResult
from .db import SupabaseClient

__all__ = [
    'normalize_contract_code',
    'ProFormaLoader',
    'CompensationLoader',
    'HarvestHoursLoader',
    'HarvestExpensesLoader',
    'PnLLoader',
    'ProjectClassifier',
    'classify_all_activity',
    'calculate_labor_costs',
    'calculate_expense_costs',
    'merge_direct_costs',
    'OverheadAllocator',
    'calculate_margins',
    'run_all_validations',
    'ValidationResult',
    'SupabaseClient',
]
