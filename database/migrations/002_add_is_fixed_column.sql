-- Migration: Add is_fixed column to expense_scenarios table
-- Description: Adds the missing is_fixed column to distinguish between fixed and variable expenses
-- Version: 1.1
-- Date: 2025-08-16

-- Add is_fixed column to expense_scenarios table
ALTER TABLE expense_scenarios 
ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT false;

-- Update existing records to set appropriate is_fixed values based on category
-- Housing, insurance, debt payments are typically fixed
UPDATE expense_scenarios 
SET is_fixed = true 
WHERE category IN ('housing', 'insurance', 'debt', 'utilities');

-- Other categories are typically variable
UPDATE expense_scenarios 
SET is_fixed = false 
WHERE category NOT IN ('housing', 'insurance', 'debt', 'utilities');

-- Add comment for documentation
COMMENT ON COLUMN expense_scenarios.is_fixed IS 'Indicates whether this expense is fixed (true) or variable (false)';

-- Migration complete
-- Added is_fixed column to expense_scenarios table
-- Updated existing records with appropriate default values
