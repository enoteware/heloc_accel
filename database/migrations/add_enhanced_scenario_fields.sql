-- Migration: Add enhanced scenario fields for new payment highlighting features
-- Date: 2025-01-30

-- Add PMI monthly field to scenarios table (if not exists)
ALTER TABLE scenarios 
ADD COLUMN IF NOT EXISTS pmi_monthly DECIMAL(8,2) DEFAULT 0;

-- Add fields for storing enhanced calculation results
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS heloc_max_used DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS heloc_average_balance DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS heloc_total_mortgage_interest DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS heloc_total_heloc_interest DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS traditional_monthly_payment DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS traditional_total_payments DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS percentage_interest_saved DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS time_saved_years DECIMAL(5,2);

-- Add JSONB column for storing complete calculation results
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS calculation_results_json JSONB,
ADD COLUMN IF NOT EXISTS heloc_schedule_json JSONB;

-- Add index on calculation results for faster queries
CREATE INDEX IF NOT EXISTS idx_scenarios_calculation_results ON scenarios USING gin (calculation_results_json);

-- Update existing calculation_results table to include new fields
ALTER TABLE calculation_results
ADD COLUMN IF NOT EXISTS discretionary_used DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pmi_payment DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_monthly_payment DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS extra_payment_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ltv_ratio DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS net_heloc_change DECIMAL(10,2) DEFAULT 0;

-- Add composite index for efficient scenario detail queries
CREATE INDEX IF NOT EXISTS idx_calculation_results_scenario_month 
ON calculation_results(scenario_id, month_number);

-- Add comments for documentation
COMMENT ON COLUMN scenarios.pmi_monthly IS 'Private Mortgage Insurance monthly payment';
COMMENT ON COLUMN scenarios.heloc_max_used IS 'Maximum HELOC balance used during payoff period';
COMMENT ON COLUMN scenarios.heloc_average_balance IS 'Average HELOC balance throughout payoff period';
COMMENT ON COLUMN scenarios.calculation_results_json IS 'Complete calculation results including all comparison data';
COMMENT ON COLUMN scenarios.heloc_schedule_json IS 'Full HELOC payment schedule with month-by-month details';
COMMENT ON COLUMN calculation_results.discretionary_used IS 'Discretionary income used for extra payment this month';
COMMENT ON COLUMN calculation_results.extra_payment_amount IS 'Additional principal payment from HELOC strategy';
COMMENT ON COLUMN calculation_results.ltv_ratio IS 'Loan-to-value ratio for this month';