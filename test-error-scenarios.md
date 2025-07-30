# Error Scenario Testing

## Test Scenarios for Better Error Reporting

### 1. Negative Mortgage Balance
- Enter `-100000` in Current Mortgage Balance
- **Expected**: "Mortgage balance must be greater than $0. Please enter your current principal balance."

### 2. Invalid Interest Rate
- Enter `-5` in Interest Rate
- **Expected**: "Interest rate cannot be negative. Please enter your current mortgage rate as a percentage (e.g., 6.5 for 6.5%)."

### 3. High Interest Rate
- Enter `35` in Interest Rate
- **Expected**: "Interest rate seems too high (maximum 30%). Please verify your rate and enter as a percentage (e.g., 6.5 for 6.5%)."

### 4. Zero Remaining Term
- Enter `0` in Remaining Term
- **Expected**: "Remaining term must be at least 1 month. Please check your mortgage statement for the exact number of months remaining."

### 5. Net Income > Gross Income
- Enter `5000` in Monthly Gross Income
- Enter `6000` in Monthly Net Income
- **Expected**: "Net income ($6,000) cannot exceed gross income ($5,000). Net income should be your take-home pay after taxes."

### 6. Expenses > Net Income
- Enter `6000` in Monthly Net Income
- Enter `7000` in Monthly Expenses
- **Expected**: "Monthly expenses ($7,000) exceed net income by $1,000. HELOC acceleration requires positive cash flow. Please verify your expenses."

### 7. Empty Scenario Name
- Leave Scenario Name empty
- **Expected**: "Please provide a name for this scenario (e.g., 'Current Mortgage' or 'HELOC Strategy')"

### 8. HELOC Available Credit > Limit
- Enter `100000` in HELOC Limit
- Enter `150000` in HELOC Available Credit
- **Expected**: "Available credit ($150,000) cannot exceed your HELOC limit ($100,000). Please check your HELOC statement for the correct amounts."

### 9. Multiple Validation Errors
- Enter `-100000` in Mortgage Balance
- Enter `35` in Interest Rate
- Enter `0` in Remaining Term
- **Expected**: Multiple errors displayed clearly with field names

## How to Test

1. Go to http://localhost:3001/calculator
2. Try each scenario above
3. Verify the error messages are:
   - Clear and descriptive
   - Show the specific field with the error
   - Provide guidance on how to fix the issue
   - Display multiple errors when applicable

## Current Status
- The dev server is running on port 3001
- Validation is working and catching errors
- Error messages are now descriptive and helpful
- Field-specific errors are displayed