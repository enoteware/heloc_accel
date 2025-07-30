# Manual Testing Scenarios for LTV/PMI Implementation

## Test Scenarios

### Scenario 1: High LTV (90%) - PMI Required
**Input:**
- Current Mortgage Balance: $450,000
- Property Value: $500,000
- Expected LTV: 90%
- Expected PMI Required: Yes
- Expected Suggested PMI: $281/month

**Expected Behavior:**
- LTV Analysis panel shows "LTV: 90.0%" with orange background
- PMI field is marked as required with asterisk (*)
- "Use Suggested" button shows $281/mo
- Validation error if PMI is left at $0

### Scenario 2: Boundary LTV (80%) - PMI Not Required
**Input:**
- Current Mortgage Balance: $400,000
- Property Value: $500,000
- Expected LTV: 80%
- Expected PMI Required: No
- Expected Suggested PMI: $0/month

**Expected Behavior:**
- LTV Analysis panel shows "LTV: 80.0%" with green background
- PMI field is optional (no asterisk)
- No "Use Suggested" button
- No validation error if PMI is $0

### Scenario 3: Low LTV (70%) with PMI - Warning
**Input:**
- Current Mortgage Balance: $350,000
- Property Value: $500,000
- PMI Monthly: $175
- Expected LTV: 70%
- Expected PMI Required: No

**Expected Behavior:**
- LTV Analysis panel shows "LTV: 70.0%" with green background
- Warning message about PMI not being required
- Suggestion to contact lender about removing PMI

### Scenario 4: Very High LTV (120%) - PMI Required
**Input:**
- Current Mortgage Balance: $600,000
- Property Value: $500,000
- Expected LTV: 120%
- Expected PMI Required: Yes
- Expected Suggested PMI: $625/month

**Expected Behavior:**
- LTV Analysis panel shows "LTV: 120.0%" with orange background
- Strong PMI requirement indication
- High suggested PMI amount

### Scenario 5: Invalid Inputs - Error Handling
**Input:**
- Current Mortgage Balance: "invalid"
- Property Value: "also-invalid"

**Expected Behavior:**
- No LTV Analysis panel displayed
- No crash or JavaScript errors
- Graceful degradation

### Scenario 6: Missing Property Value - Graceful Handling
**Input:**
- Current Mortgage Balance: $450,000
- Property Value: (empty)

**Expected Behavior:**
- No LTV Analysis panel displayed
- PMI field remains optional
- No validation errors related to LTV

## Forms to Test

### 1. FastCalculatorForm
- Navigate to main calculator page
- Test all scenarios above
- Verify LTV Analysis panel appearance
- Test "Use Suggested" button functionality
- Verify form validation messages

### 2. LiveCalculatorForm
- Navigate to live calculator
- Test scenarios 1, 2, and 3
- Verify compact LTV analysis display
- Check conditional PMI field styling
- Verify real-time updates

### 3. CalculatorForm
- Navigate to basic calculator
- Test scenarios 1, 2, and 3
- Verify LTV analysis panel
- Check PMI field integration
- Verify form submission behavior

## Debug Testing

### Enable Debug Mode
1. Open browser console
2. Run: `debugHeloc.enable()`
3. Perform test scenarios
4. Check debug logs: `debugHeloc.logs()`

### Error Monitoring
1. Open browser console
2. Run: `errorMonitor.getSummary()`
3. Perform test scenarios with invalid inputs
4. Check error reports: `errorMonitor.getErrors()`

### Debug Panel Testing
1. Look for debug button in bottom-right corner
2. Click to open debug panel
3. Perform test scenarios
4. Monitor real-time logs and errors
5. Test export and copy functionality

## Performance Testing

### Rapid Input Changes
1. Quickly change mortgage balance values
2. Quickly change property values
3. Verify no performance degradation
4. Check for memory leaks in debug panel

### Large Numbers
1. Test with very large property values ($10M+)
2. Test with very large loan amounts
3. Verify calculations remain accurate
4. Check for any overflow issues

## Cross-Browser Testing

Test all scenarios in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Testing

Test responsive behavior on:
- iPhone (Safari)
- Android (Chrome)
- Tablet devices

## Validation Testing

### Form Validation
1. Submit forms with missing required fields
2. Verify LTV-based PMI validation messages
3. Test validation with edge case LTV values
4. Check validation message clarity

### Error Recovery
1. Enter invalid data
2. Correct the data
3. Verify error messages clear properly
4. Check form state recovery

## Integration Testing

### Calculation Integration
1. Complete full form submission
2. Verify PMI is included in calculations
3. Check amortization schedule includes PMI
4. Verify PMI removal at 20% equity

### Data Persistence
1. Fill out form partially
2. Navigate away and back
3. Verify data persistence
4. Check LTV calculations restore correctly

## Accessibility Testing

### Screen Reader Testing
1. Test with screen reader software
2. Verify LTV analysis is announced
3. Check PMI requirement announcements
4. Verify error message accessibility

### Keyboard Navigation
1. Navigate forms using only keyboard
2. Verify all interactive elements accessible
3. Check focus management
4. Test tab order

## Expected Debug Output Examples

### Successful LTV Calculation
```
[DEBUG] [LTV] LTV calculation completed: {
  loanAmount: 450000,
  propertyValue: 500000,
  ltvRatio: 90,
  isMIPRequired: true,
  suggestedMonthlyPMI: 281
}
```

### Validation Error
```
[WARN] [VALIDATION] Form validation: FastCalculatorForm.pmiMonthly {
  fieldValue: 0,
  validationErrors: ["MIP/PMI is required when LTV exceeds 80% (current LTV: 90.0%)"]
}
```

### Error Handling
```
[ERROR] [CALCULATION] LTV calculation failed: {
  loanAmount: "invalid",
  propertyValue: 500000,
  error: "Loan amount and property value must be valid numbers"
}
```
