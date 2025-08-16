-- Migration: Add Budgeting Tool Schema
-- Description: Extends existing HELOC Accelerator database with budgeting tool functionality
-- Version: 1.0
-- Date: 2025-08-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add budgeting-specific fields to existing scenarios table
ALTER TABLE scenarios 
ADD COLUMN IF NOT EXISTS has_budgeting_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_principal_multiplier DECIMAL(3,1) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS budget_scenario_count INTEGER DEFAULT 0;

-- Create budget_scenarios table
CREATE TABLE IF NOT EXISTS budget_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Base Income/Expense Data
    base_monthly_gross_income DECIMAL(10,2) NOT NULL CHECK (base_monthly_gross_income >= 0),
    base_monthly_net_income DECIMAL(10,2) NOT NULL CHECK (base_monthly_net_income >= 0),
    base_monthly_expenses DECIMAL(10,2) NOT NULL CHECK (base_monthly_expenses >= 0),
    
    -- Calculated Fields
    base_discretionary_income DECIMAL(10,2) NOT NULL,
    recommended_principal_payment DECIMAL(10,2) NOT NULL CHECK (recommended_principal_payment >= 0),
    custom_principal_payment DECIMAL(10,2) CHECK (custom_principal_payment >= 0),
    
    -- Configuration
    principal_multiplier DECIMAL(3,1) DEFAULT 3.0 CHECK (principal_multiplier > 0),
    auto_adjust_payments BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_income_expense CHECK (base_monthly_net_income <= base_monthly_gross_income),
    CONSTRAINT valid_discretionary CHECK (base_discretionary_income = base_monthly_net_income - base_monthly_expenses),
    CONSTRAINT unique_active_budget_per_scenario UNIQUE (scenario_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create income_scenarios table
CREATE TABLE IF NOT EXISTS income_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Scenario Details
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN (
        'raise', 'bonus', 'job_loss', 'side_income', 'investment_income', 
        'overtime', 'commission', 'rental_income', 'other'
    )),
    amount DECIMAL(10,2) NOT NULL,
    
    -- Timing
    start_month INTEGER NOT NULL CHECK (start_month > 0),
    end_month INTEGER CHECK (end_month IS NULL OR end_month >= start_month),
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN (
        'monthly', 'quarterly', 'annually', 'one_time'
    )),
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5,4) DEFAULT 0.25 CHECK (tax_rate >= 0 AND tax_rate <= 1),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_timing CHECK (end_month IS NULL OR end_month > start_month OR frequency = 'one_time')
);

-- Create expense_scenarios table
CREATE TABLE IF NOT EXISTS expense_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Expense Details
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'housing', 'utilities', 'food', 'transportation', 'insurance', 
        'debt', 'discretionary', 'emergency', 'healthcare', 'education',
        'childcare', 'entertainment', 'other'
    )),
    subcategory VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    
    -- Timing
    start_month INTEGER NOT NULL CHECK (start_month > 0),
    end_month INTEGER CHECK (end_month IS NULL OR end_month >= start_month),
    frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN (
        'monthly', 'quarterly', 'annually', 'one_time'
    )),
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    is_essential BOOLEAN DEFAULT true,
    priority_level INTEGER DEFAULT 5 CHECK (priority_level >= 1 AND priority_level <= 10),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_timing CHECK (end_month IS NULL OR end_month > start_month OR frequency = 'one_time')
);

-- Create budget_calculation_results table
CREATE TABLE IF NOT EXISTS budget_calculation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL CHECK (month_number > 0),
    
    -- Monthly Income/Expense Breakdown
    monthly_gross_income DECIMAL(10,2) NOT NULL CHECK (monthly_gross_income >= 0),
    monthly_net_income DECIMAL(10,2) NOT NULL CHECK (monthly_net_income >= 0),
    monthly_expenses DECIMAL(10,2) NOT NULL CHECK (monthly_expenses >= 0),
    discretionary_income DECIMAL(10,2) NOT NULL,
    
    -- Payment Calculations
    recommended_principal_payment DECIMAL(10,2) NOT NULL CHECK (recommended_principal_payment >= 0),
    actual_principal_payment DECIMAL(10,2) NOT NULL CHECK (actual_principal_payment >= 0),
    payment_adjustment_reason VARCHAR(255),
    
    -- Mortgage Details
    beginning_mortgage_balance DECIMAL(12,2) NOT NULL CHECK (beginning_mortgage_balance >= 0),
    ending_mortgage_balance DECIMAL(12,2) NOT NULL CHECK (ending_mortgage_balance >= 0),
    mortgage_payment DECIMAL(10,2) NOT NULL CHECK (mortgage_payment >= 0),
    mortgage_interest DECIMAL(10,2) NOT NULL CHECK (mortgage_interest >= 0),
    mortgage_principal DECIMAL(10,2) NOT NULL CHECK (mortgage_principal >= 0),
    
    -- HELOC Details
    beginning_heloc_balance DECIMAL(12,2) DEFAULT 0 CHECK (beginning_heloc_balance >= 0),
    ending_heloc_balance DECIMAL(12,2) DEFAULT 0 CHECK (ending_heloc_balance >= 0),
    heloc_payment DECIMAL(10,2) DEFAULT 0 CHECK (heloc_payment >= 0),
    heloc_interest DECIMAL(10,2) DEFAULT 0 CHECK (heloc_interest >= 0),
    heloc_principal DECIMAL(10,2) DEFAULT 0,
    
    -- PMI Tracking
    pmi_payment DECIMAL(8,2) DEFAULT 0 CHECK (pmi_payment >= 0),
    current_ltv DECIMAL(5,2) CHECK (current_ltv >= 0 AND current_ltv <= 200),
    pmi_eliminated BOOLEAN DEFAULT false,
    
    -- Cumulative Totals
    cumulative_interest_paid DECIMAL(12,2) NOT NULL CHECK (cumulative_interest_paid >= 0),
    cumulative_principal_paid DECIMAL(12,2) NOT NULL CHECK (cumulative_principal_paid >= 0),
    cumulative_interest_saved DECIMAL(12,2) NOT NULL,
    cumulative_time_saved_months INTEGER NOT NULL,
    
    -- Cash Flow Analysis
    total_monthly_outflow DECIMAL(10,2) NOT NULL CHECK (total_monthly_outflow >= 0),
    remaining_cash_flow DECIMAL(10,2) NOT NULL,
    cash_flow_stress_ratio DECIMAL(5,4) CHECK (cash_flow_stress_ratio >= 0),
    
    -- Metadata
    calculation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    calculation_version VARCHAR(20) DEFAULT '1.0',
    
    -- Constraints
    CONSTRAINT unique_month_per_scenario UNIQUE (budget_scenario_id, month_number),
    CONSTRAINT valid_mortgage_balance CHECK (ending_mortgage_balance <= beginning_mortgage_balance),
    CONSTRAINT valid_payment_breakdown CHECK (mortgage_payment = mortgage_interest + mortgage_principal)
);

-- Create budget_scenario_templates table for common scenarios
CREATE TABLE IF NOT EXISTS budget_scenario_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- Template Data (JSON format for flexibility)
    income_template JSONB,
    expense_template JSONB,
    scenario_template JSONB,
    
    -- Configuration
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_scenario_id ON budget_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_active ON budget_scenarios(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_budget_scenarios_created_at ON budget_scenarios(created_at);

CREATE INDEX IF NOT EXISTS idx_income_scenarios_budget_id ON income_scenarios(budget_scenario_id);
CREATE INDEX IF NOT EXISTS idx_income_scenarios_active ON income_scenarios(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_income_scenarios_timing ON income_scenarios(start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_income_scenarios_type ON income_scenarios(scenario_type);

CREATE INDEX IF NOT EXISTS idx_expense_scenarios_budget_id ON expense_scenarios(budget_scenario_id);
CREATE INDEX IF NOT EXISTS idx_expense_scenarios_active ON expense_scenarios(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_expense_scenarios_timing ON expense_scenarios(start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_expense_scenarios_category ON expense_scenarios(category);

CREATE INDEX IF NOT EXISTS idx_budget_calc_results_budget_id ON budget_calculation_results(budget_scenario_id);
CREATE INDEX IF NOT EXISTS idx_budget_calc_results_month ON budget_calculation_results(budget_scenario_id, month_number);
CREATE INDEX IF NOT EXISTS idx_budget_calc_results_timestamp ON budget_calculation_results(calculation_timestamp);

CREATE INDEX IF NOT EXISTS idx_budget_templates_category ON budget_scenario_templates(category);
CREATE INDEX IF NOT EXISTS idx_budget_templates_public ON budget_scenario_templates(is_public) WHERE is_public = true;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_scenarios_updated_at 
    BEFORE UPDATE ON budget_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_scenarios_updated_at 
    BEFORE UPDATE ON income_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_scenarios_updated_at 
    BEFORE UPDATE ON expense_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_templates_updated_at 
    BEFORE UPDATE ON budget_scenario_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate discretionary income
CREATE OR REPLACE FUNCTION calculate_discretionary_income()
RETURNS TRIGGER AS $$
BEGIN
    NEW.base_discretionary_income = NEW.base_monthly_net_income - NEW.base_monthly_expenses;
    NEW.recommended_principal_payment = NEW.base_discretionary_income * NEW.principal_multiplier;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_calculate_discretionary_income 
    BEFORE INSERT OR UPDATE ON budget_scenarios 
    FOR EACH ROW EXECUTE FUNCTION calculate_discretionary_income();

-- Create function to update scenario count
CREATE OR REPLACE FUNCTION update_budget_scenario_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE scenarios 
        SET budget_scenario_count = budget_scenario_count + 1,
            has_budgeting_enabled = true
        WHERE id = NEW.scenario_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE scenarios 
        SET budget_scenario_count = GREATEST(0, budget_scenario_count - 1)
        WHERE id = OLD.scenario_id;
        
        -- Disable budgeting if no budget scenarios remain
        UPDATE scenarios 
        SET has_budgeting_enabled = false
        WHERE id = OLD.scenario_id 
        AND budget_scenario_count = 0;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scenario_budget_count 
    AFTER INSERT OR DELETE ON budget_scenarios 
    FOR EACH ROW EXECUTE FUNCTION update_budget_scenario_count();

-- Insert default budget scenario templates
INSERT INTO budget_scenario_templates (name, description, category, income_template, expense_template, scenario_template) VALUES
('Emergency Fund Depletion', 'Model the impact of using emergency funds for mortgage acceleration', 'emergency', 
 '[]'::jsonb, 
 '[{"category": "emergency", "amount": 5000, "frequency": "one_time", "start_month": 1}]'::jsonb,
 '{"description": "One-time emergency expense requiring fund depletion"}'::jsonb),

('Annual Raise Scenario', 'Model a typical annual salary increase', 'income_growth',
 '[{"type": "raise", "amount": 3000, "frequency": "monthly", "start_month": 13}]'::jsonb,
 '[]'::jsonb,
 '{"description": "3% annual raise starting in month 13"}'::jsonb),

('Side Income Addition', 'Model additional income from freelancing or part-time work', 'income_growth',
 '[{"type": "side_income", "amount": 1000, "frequency": "monthly", "start_month": 1}]'::jsonb,
 '[]'::jsonb,
 '{"description": "Consistent side income from freelancing"}'::jsonb),

('Child Care Expense', 'Model the impact of new childcare expenses', 'life_changes',
 '[]'::jsonb,
 '[{"category": "childcare", "amount": 1200, "frequency": "monthly", "start_month": 1, "end_month": 60}]'::jsonb,
 '{"description": "Childcare expenses for 5 years"}'::jsonb);

-- Add comments for documentation
COMMENT ON TABLE budget_scenarios IS 'Stores budgeting scenarios with income/expense baselines and calculation parameters';
COMMENT ON TABLE income_scenarios IS 'Stores income change scenarios (raises, bonuses, job loss, etc.)';
COMMENT ON TABLE expense_scenarios IS 'Stores expense change scenarios (emergencies, new recurring costs, etc.)';
COMMENT ON TABLE budget_calculation_results IS 'Stores detailed month-by-month calculation results for budget scenarios';
COMMENT ON TABLE budget_scenario_templates IS 'Predefined templates for common budgeting scenarios';

-- Grant appropriate permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON budget_scenarios TO heloc_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON income_scenarios TO heloc_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON expense_scenarios TO heloc_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON budget_calculation_results TO heloc_app_user;
-- GRANT SELECT ON budget_scenario_templates TO heloc_app_user;

-- Migration complete
-- Version: 1.0
-- Tables created: 4 main tables + 1 template table
-- Indexes created: 12 performance indexes
-- Triggers created: 6 automation triggers
-- Functions created: 3 utility functions
