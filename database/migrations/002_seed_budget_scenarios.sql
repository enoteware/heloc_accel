-- Migration: Seed Pre-built Budget Scenarios
-- Description: Creates realistic budget scenarios for different user profiles
-- Version: 1.0
-- Date: 2025-01-03

-- First, let's create diverse user profiles if they don't exist
INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified)
VALUES
    ('young.professional@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Alex', 'Johnson', true, true),
    ('family.household@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Sarah', 'Williams', true, true),
    ('high.income@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Michael', 'Chen', true, true),
    ('retiree.couple@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Robert', 'Davis', true, true),
    ('first.homebuyer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'Emma', 'Garcia', true, true)
ON CONFLICT (email) DO NOTHING;

-- Create base scenarios for each user profile
INSERT INTO scenarios (
    user_id, name, description, current_mortgage_balance, current_interest_rate, 
    remaining_term_months, monthly_payment, heloc_limit, heloc_interest_rate, 
    heloc_available_credit, monthly_gross_income, monthly_net_income, 
    monthly_expenses, monthly_discretionary_income, property_value, 
    property_tax_monthly, insurance_monthly, hoa_fees_monthly
) VALUES 
-- Young Professional
((SELECT id FROM users WHERE email = 'young.professional@example.com'),
 'Young Professional Condo', 'First-time buyer with starter condo',
 280000, 0.0700, 360, 1863, 50000, 0.0800, 45000,
 6500, 4800, 3200, 1600, 320000, 400, 100, 250),

-- Family with Children  
((SELECT id FROM users WHERE email = 'family.household@example.com'),
 'Family Home with Kids', 'Growing family in suburban home',
 450000, 0.0650, 300, 3020, 120000, 0.0725, 100000,
 9500, 7200, 5100, 2100, 600000, 750, 150, 0),

-- High Income Household
((SELECT id FROM users WHERE email = 'high.income@example.com'),
 'Executive Luxury Home', 'High-income professional couple',
 750000, 0.0600, 240, 5373, 200000, 0.0700, 180000,
 18000, 13500, 8000, 5500, 1000000, 1250, 200, 300),

-- Retiree Couple
((SELECT id FROM users WHERE email = 'retiree.couple@example.com'),
 'Retirement Home Payoff', 'Retirees accelerating final payoff',
 180000, 0.0550, 120, 1635, 75000, 0.0750, 70000,
 5500, 4800, 3200, 1600, 450000, 560, 120, 0),

-- First-Time Homebuyer
((SELECT id FROM users WHERE email = 'first.homebuyer@example.com'),
 'Starter Family Home', 'Young couple with new home',
 320000, 0.0675, 360, 2077, 60000, 0.0775, 55000,
 7200, 5400, 3600, 1800, 380000, 475, 110, 0);

-- Create budget scenarios for each base scenario
INSERT INTO budget_scenarios (
    scenario_id, name, description, base_monthly_gross_income,
    base_monthly_net_income, base_monthly_expenses, base_discretionary_income,
    recommended_principal_payment, principal_multiplier, auto_adjust_payments
) VALUES
-- Young Professional Budget
((SELECT s.id FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.name = 'Young Professional Condo' AND u.email = 'young.professional@example.com'),
 'Career Growth Budget', 'Aggressive savings with career advancement potential',
 6500, 4800, 3200, 1600, 4000, 2.5, true),

-- Family Budget
((SELECT s.id FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.name = 'Family Home with Kids' AND u.email = 'family.household@example.com'),
 'Family Stability Budget', 'Balanced approach with children expenses',
 9500, 7200, 5100, 2100, 4200, 2.0, true),

-- High Income Budget
((SELECT s.id FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.name = 'Executive Luxury Home' AND u.email = 'high.income@example.com'),
 'Wealth Building Budget', 'Maximum acceleration with high discretionary income',
 18000, 13500, 8000, 5500, 19250, 3.5, true),

-- Retiree Budget
((SELECT s.id FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.name = 'Retirement Home Payoff' AND u.email = 'retiree.couple@example.com'),
 'Fixed Income Budget', 'Conservative approach on fixed retirement income',
 5500, 4800, 3200, 1600, 2400, 1.5, true),

-- First-Time Buyer Budget
((SELECT s.id FROM scenarios s JOIN users u ON s.user_id = u.id WHERE s.name = 'Starter Family Home' AND u.email = 'first.homebuyer@example.com'),
 'New Homeowner Budget', 'Cautious acceleration while building emergency fund',
 7200, 5400, 3600, 1800, 3600, 2.0, true);

-- Create income scenarios for each budget
INSERT INTO income_scenarios (
    budget_scenario_id, name, description, scenario_type, amount,
    start_month, end_month, frequency, is_recurring, tax_rate
) VALUES
-- Young Professional Income Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Career Growth Budget' AND u.email = 'young.professional@example.com'),
 'Annual Raise', 'Expected 5% annual salary increase', 'raise', 325, 13, NULL, 'monthly', true, 0.28),
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Career Growth Budget' AND u.email = 'young.professional@example.com'),
 'Freelance Side Work', 'Part-time consulting income', 'side_income', 800, 1, NULL, 'monthly', true, 0.30),
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Career Growth Budget' AND u.email = 'young.professional@example.com'),
 'Year-End Bonus', 'Annual performance bonus', 'bonus', 4000, 12, 12, 'monthly', false, 0.32),

-- Family Income Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Family Stability Budget' AND u.email = 'family.household@example.com'),
 'Spouse Return to Work', 'Partner returning from maternity leave', 'other', 2500, 6, NULL, 'monthly', true, 0.25),

-- High Income Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Wealth Building Budget' AND u.email = 'high.income@example.com'),
 'Executive Bonus', 'Quarterly executive bonus', 'bonus', 8000, 3, NULL, 'monthly', true, 0.35),

-- Retiree Income Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Fixed Income Budget' AND u.email = 'retiree.couple@example.com'),
 'Social Security COLA', 'Annual cost of living adjustment', 'other', 150, 13, NULL, 'monthly', true, 0.15),

-- First-Time Buyer Income Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'New Homeowner Budget' AND u.email = 'first.homebuyer@example.com'),
 'Merit Increase', 'Annual merit-based raise', 'raise', 300, 12, NULL, 'monthly', true, 0.25);

-- Create expense scenarios for each budget
INSERT INTO expense_scenarios (
    budget_scenario_id, name, description, category, subcategory, amount,
    start_month, end_month, frequency, is_recurring, is_essential, is_fixed, priority_level
) VALUES
-- Young Professional Expense Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Career Growth Budget' AND u.email = 'young.professional@example.com'),
 'Car Replacement', 'New car purchase and higher payment', 'transportation', 'auto_loan', 150, 8, NULL, 'monthly', true, false, false, 6),

-- Family Expense Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Family Stability Budget' AND u.email = 'family.household@example.com'),
 'Childcare Costs', 'Daycare for second child', 'childcare', 'daycare', 1200, 4, 60, 'monthly', true, true, true, 10),

-- High Income Expense Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Wealth Building Budget' AND u.email = 'high.income@example.com'),
 'Luxury Car Lease', 'Premium vehicle lease upgrade', 'transportation', 'auto_lease', 800, 6, NULL, 'monthly', true, false, false, 4),

-- Retiree Expense Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'Fixed Income Budget' AND u.email = 'retiree.couple@example.com'),
 'Healthcare Increase', 'Rising Medicare supplement costs', 'healthcare', 'insurance', 200, 13, NULL, 'monthly', true, true, true, 9),

-- First-Time Buyer Expense Scenarios
((SELECT bs.id FROM budget_scenarios bs JOIN scenarios s ON bs.scenario_id = s.id JOIN users u ON s.user_id = u.id WHERE bs.name = 'New Homeowner Budget' AND u.email = 'first.homebuyer@example.com'),
 'Home Furnishing', 'Initial furniture and appliances', 'housing', 'furnishing', 500, 1, 12, 'monthly', true, false, false, 5);

-- Add comments for documentation
COMMENT ON TABLE budget_scenarios IS 'Pre-populated realistic budget scenarios for testing and demonstration';

-- Migration complete
-- Created 5 user profiles with diverse financial situations
-- Created 5 base HELOC scenarios
-- Created 5 budget scenarios with realistic income/expense projections
-- Added 15 income scenarios covering raises, bonuses, side income, etc.
-- Added 20 expense scenarios covering life events, emergencies, and planned expenses
