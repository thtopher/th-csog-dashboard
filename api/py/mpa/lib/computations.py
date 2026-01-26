"""
Cost Computations for Monthly Performance Analysis

Computes:
1. Labor costs (hours x hourly_cost)
2. Expense costs (non-reimbursable only)
3. Direct cost merging into revenue table
"""

import pandas as pd
from typing import List, Tuple


def calculate_labor_costs(
    hours_df: pd.DataFrame,
    comp_df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, List[str]]:
    """
    Calculate labor costs by joining hours with compensation rates.

    Args:
        hours_df: Harvest hours data (contract_code, staff_key, hours)
        comp_df: Compensation data (staff_key, hourly_cost)

    Returns:
        Tuple of:
        - DataFrame with labor costs by contract_code
        - DataFrame with detailed hours (for drill-down)
        - List of log messages

    Note:
        Staff missing from compensation file will be excluded from labor cost calculations
        and flagged as a warning.
    """
    logs = []

    merged = hours_df.merge(
        comp_df[["staff_key", "hourly_cost"]],
        on="staff_key",
        how="left",
    )

    missing = merged[merged["hourly_cost"].isna()]
    if len(missing) > 0:
        missing_staff = sorted(set(missing["staff_key"].astype(str)))
        missing_hours = missing["hours"].sum()
        logs.append(f"{len(missing_staff)} staff missing compensation records ({missing_hours:.1f} hours excluded)")
        merged = merged[merged["hourly_cost"].notna()]

    merged["labor_cost"] = merged["hours"] * merged["hourly_cost"]

    # Create detailed hours for drill-down (aggregated by contract_code + staff_key)
    hours_detail = (
        merged.groupby(["contract_code", "staff_key"]).agg({
            "hours": "sum",
            "hourly_cost": "first",
            "labor_cost": "sum",
        }).reset_index()
    )

    # Aggregate by project for summary
    labor_by_project = (
        merged.groupby("contract_code").agg({
            "hours": "sum",
            "labor_cost": "sum",
        }).reset_index()
    )

    return labor_by_project, hours_detail, logs


def calculate_expense_costs(expenses_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Calculate expense costs (already filtered to non-reimbursable).

    Args:
        expenses_df: Filtered expenses data (contract_code, amount)

    Returns:
        Tuple of:
        - DataFrame with expense costs by contract_code
        - DataFrame with expense detail (for drill-down)
    """
    # Keep detail for drill-down
    expense_detail = expenses_df[['contract_code', 'date', 'amount', 'notes']].copy()
    expense_detail.rename(columns={'date': 'expense_date'}, inplace=True)

    # Aggregate by project
    expense_by_project = (
        expenses_df.groupby("contract_code").agg({"amount": "sum"}).reset_index()
    )
    expense_by_project.rename(columns={"amount": "expense_cost"}, inplace=True)

    return expense_by_project, expense_detail


def merge_direct_costs(
    revenue_df: pd.DataFrame,
    labor_df: pd.DataFrame,
    expense_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Merge direct costs into revenue centers table.

    Args:
        revenue_df: Revenue centers from Pro Forma
        labor_df: Labor costs by contract_code
        expense_df: Expense costs by contract_code

    Returns:
        DataFrame with revenue + direct costs
    """
    out = revenue_df.merge(labor_df, on="contract_code", how="left")
    out = out.merge(expense_df, on="contract_code", how="left")
    out["hours"] = out.get("hours", 0).fillna(0.0)
    out["labor_cost"] = out.get("labor_cost", 0).fillna(0.0)
    out["expense_cost"] = out.get("expense_cost", 0).fillna(0.0)
    return out


def calculate_cost_center_costs(
    cost_centers_df: pd.DataFrame,
    hours_detail_df: pd.DataFrame,
    expense_detail_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Calculate costs for cost centers from hours and expenses.

    Args:
        cost_centers_df: Cost centers with contract_code, description, pool
        hours_detail_df: Detailed hours with labor_cost
        expense_detail_df: Detailed expenses with amount

    Returns:
        Cost centers DataFrame with hours, labor_cost, expense_cost, total_cost
    """
    # Aggregate labor by cost center
    cc_labor = hours_detail_df[
        hours_detail_df['contract_code'].isin(cost_centers_df['contract_code'])
    ].groupby('contract_code').agg({
        'hours': 'sum',
        'labor_cost': 'sum'
    }).reset_index()

    # Aggregate expenses by cost center
    cc_expenses = expense_detail_df[
        expense_detail_df['contract_code'].isin(cost_centers_df['contract_code'])
    ].groupby('contract_code').agg({
        'amount': 'sum'
    }).reset_index()
    cc_expenses.rename(columns={'amount': 'expense_cost'}, inplace=True)

    # Merge into cost centers
    result = cost_centers_df.merge(cc_labor, on='contract_code', how='left')
    result = result.merge(cc_expenses, on='contract_code', how='left')

    # Fill NaN and calculate total
    result['hours'] = result['hours'].fillna(0.0)
    result['labor_cost'] = result['labor_cost'].fillna(0.0)
    result['expense_cost'] = result['expense_cost'].fillna(0.0)
    result['total_cost'] = result['labor_cost'] + result['expense_cost']

    return result


def calculate_non_revenue_client_costs(
    non_revenue_df: pd.DataFrame,
    hours_detail_df: pd.DataFrame,
    expense_detail_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Calculate costs for non-revenue clients from hours and expenses.

    Args:
        non_revenue_df: Non-revenue clients with contract_code
        hours_detail_df: Detailed hours with labor_cost
        expense_detail_df: Detailed expenses with amount

    Returns:
        Non-revenue clients DataFrame with hours, labor_cost, expense_cost, total_cost
    """
    if non_revenue_df.empty:
        return non_revenue_df

    # Aggregate labor
    nrc_labor = hours_detail_df[
        hours_detail_df['contract_code'].isin(non_revenue_df['contract_code'])
    ].groupby('contract_code').agg({
        'hours': 'sum',
        'labor_cost': 'sum'
    }).reset_index()

    # Aggregate expenses
    nrc_expenses = expense_detail_df[
        expense_detail_df['contract_code'].isin(non_revenue_df['contract_code'])
    ].groupby('contract_code').agg({
        'amount': 'sum'
    }).reset_index()
    nrc_expenses.rename(columns={'amount': 'expense_cost'}, inplace=True)

    # Merge
    result = non_revenue_df.merge(nrc_labor, on='contract_code', how='left')
    result = result.merge(nrc_expenses, on='contract_code', how='left')

    # Fill and calculate
    result['hours'] = result['hours'].fillna(0.0)
    result['labor_cost'] = result['labor_cost'].fillna(0.0)
    result['expense_cost'] = result['expense_cost'].fillna(0.0)
    result['total_cost'] = result['labor_cost'] + result['expense_cost']

    return result
