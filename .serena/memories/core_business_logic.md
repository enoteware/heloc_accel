# Core Business Logic - HELOC Acceleration

## Main Calculation Algorithm
The heart of the application is the `calculateHELOCAcceleration` function in `src/lib/calculations.ts`.

### HELOC Strategy Overview
1. **Traditional Mortgage**: Fixed monthly payments over 30 years
2. **HELOC Acceleration**: Use discretionary income + HELOC to pay down mortgage principal faster

### Key Calculation Inputs
- `mortgageBalance`: Current mortgage principal
- `mortgageRate`: Annual mortgage interest rate
- `mortgagePayment`: Current monthly payment
- `helocLimit`: Maximum HELOC credit line
- `helocRate`: Annual HELOC interest rate
- `discretionaryIncome`: Monthly extra income available

### Algorithm Logic
1. **Monthly Iteration**: Calculate month-by-month until mortgage is paid off
2. **Interest Calculation**: Separate mortgage and HELOC interest
3. **Principal Acceleration**: Use discretionary income for extra principal payments
4. **HELOC Utilization**: Borrow from HELOC when beneficial (mortgage rate > HELOC rate)
5. **Balance Tracking**: Monitor both mortgage and HELOC balances

### Key Business Rules
- Maximum 50 years (600 months) calculation limit
- HELOC only used when mortgage rate ≥ HELOC rate
- Discretionary income prioritized for mortgage principal
- Remaining discretionary income pays down HELOC
- Strategy optimizes for total interest savings

### Output Metrics
- `payoffMonths`: Time to complete mortgage payoff
- `totalInterest`: Combined mortgage + HELOC interest
- `maxHelocUsed`: Peak HELOC balance utilized
- `schedule`: Month-by-month payment breakdown

## Validation & Error Handling
- Input sanitization prevents calculation errors
- Boundary condition handling (zero balances, negative inputs)
- Mathematical error recovery (division by zero, infinite loops)
- User-friendly error messages for invalid scenarios

## Performance Considerations
- Calculations run client-side for immediate feedback
- Server-side validation for security
- Optimized for typical mortgage scenarios (15-30 year terms)
- Efficient memory usage for amortization schedules