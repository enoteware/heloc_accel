-- Create scenarios for enoteware@gmail.com user
INSERT INTO scenarios (
    user_id,
    name,
    description,
    current_mortgage_balance,
    current_interest_rate,
    remaining_term_months,
    monthly_payment,
    heloc_limit,
    heloc_interest_rate,
    heloc_available_credit,
    monthly_gross_income,
    monthly_net_income,
    monthly_expenses,
    monthly_discretionary_income,
    property_value,
    property_tax_monthly,
    insurance_monthly,
    hoa_fees_monthly,
    traditional_payoff_months,
    traditional_total_interest,
    heloc_payoff_months,
    heloc_total_interest,
    time_saved_months,
    interest_saved
) VALUES 
-- First scenario
('16e6c0d3-2600-4f04-91ae-6c075d9b7b44',
 'My First HELOC Analysis', 'Exploring HELOC acceleration for my primary residence',
 350000.00, 0.0675, 348, 2250.00, 85000.00, 0.0775, 85000.00,
 8200.00, 6100.00, 4100.00, 2000.00, 425000.00, 520.00, 145.00, 0.00,
 348, 168420.00, 208, 98650.00, 140, 69770.00),

-- Second scenario
('16e6c0d3-2600-4f04-91ae-6c075d9b7b44',
 'Aggressive Payoff Strategy', 'Maximum acceleration with higher HELOC utilization',
 350000.00, 0.0675, 348, 2250.00, 100000.00, 0.0750, 100000.00,
 8200.00, 6100.00, 3800.00, 2300.00, 425000.00, 520.00, 145.00, 0.00,
 348, 168420.00, 186, 89200.00, 162, 79220.00);

-- Assign agent to enoteware user
INSERT INTO user_agent_assignments (user_id, agent_id, assignment_type, notes)
VALUES 
('16e6c0d3-2600-4f04-91ae-6c075d9b7b44',
 (SELECT id FROM agents WHERE email = 'john.smith@helocaccelerator.com'),
 'primary', 'Production user with demo scenarios')
ON CONFLICT (user_id, assignment_type) DO NOTHING;
