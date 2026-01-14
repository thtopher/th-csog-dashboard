# Excel Template Specifications

This document defines the expected format for Excel files used to upload KPI data to the Third Horizon CSOG Dashboard.

## General Guidelines

- All files must be in `.xlsx` format (Excel 2007+)
- Column headers must be in the first row
- Column names are case-insensitive and spaces are converted to underscores
- Empty rows are skipped
- Date formats should be recognizable by Excel (e.g., `2024-12-15` or `12/15/2024`)

---

## 1. Harvest Compliance Template

**File name convention**: `harvest_compliance_YYYY-WNN.xlsx` (e.g., `harvest_compliance_2024-W50.xlsx`)

**Purpose**: Track weekly time entry compliance across all staff

### Required Columns

| Column | Type | Description |
|--------|------|-------------|
| `week_ending` | Date | The Sunday that ends the week being reported |
| `employee_name` | Text | Full name of the employee |
| `hours_logged` | Number | Total hours logged in Harvest for the week |
| `hours_expected` | Number | Expected hours for the week (typically 40) |
| `compliance_status` | Text | One of: `full`, `partial`, `missing` |

### Compliance Status Definitions

- **full**: All expected hours logged with proper project/task allocation
- **partial**: Some hours logged but incomplete (< 90% of expected)
- **missing**: No time entries for the week

### Example

| week_ending | employee_name | hours_logged | hours_expected | compliance_status |
|-------------|---------------|--------------|----------------|-------------------|
| 2024-12-15 | Jane Smith | 40.0 | 40.0 | full |
| 2024-12-15 | John Doe | 32.5 | 40.0 | partial |
| 2024-12-15 | Alex Johnson | 0.0 | 40.0 | missing |

---

## 2. Training Status Template

**File name convention**: `training_status_YYYY-MM.xlsx` (e.g., `training_status_2024-12.xlsx`)

**Purpose**: Track completion of required trainings across all staff

### Required Columns

| Column | Type | Description |
|--------|------|-------------|
| `employee_name` | Text | Full name of the employee |
| `training_type` | Text | Name of the training (e.g., "Sexual Harassment", "Cybersecurity") |
| `completion_status` | Text | One of: `completed`, `in_progress`, `not_started` |
| `completion_date` | Date | Date training was completed (blank if not completed) |

### Example

| employee_name | training_type | completion_status | completion_date |
|---------------|---------------|-------------------|-----------------|
| Jane Smith | Sexual Harassment | completed | 2024-11-01 |
| Jane Smith | Cybersecurity | in_progress | |
| John Doe | Sexual Harassment | completed | 2024-10-15 |
| John Doe | Cybersecurity | not_started | |

---

## 3. Billable Hours Template

**File name convention**: `billable_hours_YYYY-WNN.xlsx` (e.g., `billable_hours_2024-W50.xlsx`)

**Purpose**: Track billable hour allocation by engagement

### Required Columns

| Column | Type | Description |
|--------|------|-------------|
| `week_ending` | Date | The Sunday that ends the week being reported |
| `employee_name` | Text | Full name of the employee |
| `engagement_name` | Text | Name of the client engagement |
| `hours_billed` | Number | Hours billed to this engagement |
| `hours_target` | Number | Target billable hours for the week |

### Example

| week_ending | employee_name | engagement_name | hours_billed | hours_target |
|-------------|---------------|-----------------|--------------|--------------|
| 2024-12-15 | Jane Smith | Client A - Strategy | 24.0 | 32.0 |
| 2024-12-15 | Jane Smith | Client B - Assessment | 8.0 | 32.0 |
| 2024-12-15 | John Doe | Client A - Strategy | 30.0 | 32.0 |

---

## Upload Process

1. Prepare your Excel file according to the appropriate template above
2. Save the file with the recommended naming convention
3. Navigate to the Dashboard → Upload section
4. Select the data type (Harvest, Training, or Billable)
5. Drag and drop or browse to select your file
6. Review the validation results
7. Confirm to import the data

### Validation

The system will automatically validate:
- Required columns are present
- Data types are correct (dates, numbers, etc.)
- Enum values are valid (compliance_status, completion_status)
- No duplicate entries for the same period

### Error Handling

If validation errors occur:
- **Errors** (red): Must be fixed before data can be imported
- **Warnings** (yellow): Data can be imported but may indicate issues

Common errors:
- Missing required columns
- Invalid date format
- Unknown compliance/completion status values
- Non-numeric values in number columns
