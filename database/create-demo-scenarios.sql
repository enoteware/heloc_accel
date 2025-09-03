-- Create Demo Scenarios for Users Without Scenarios
-- This adds realistic scenarios for testing and demonstration

-- Create scenarios for demo@helocaccelerator.com
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
-- Demo User - Starter Home Scenario
((SELECT id FROM users WHERE email = 'demo@helocaccelerator.com'),
 'Starter Home Analysis', 'First-time homeowner looking to accelerate mortgage payoff',
 285000.00, 0.0675, 348, 1850.00, 75000.00, 0.0775, 75000.00,
 7200.00, 5400.00, 3800.00, 1600.00, 350000.00, 450.00, 125.00, 0.00,
 348, 158420.00, 198, 89650.00, 150, 68770.00),

-- Demo User - Refinance Scenario
((SELECT id FROM users WHERE email = 'demo@helocaccelerator.com'),
 'Post-Refinance Strategy', 'Recently refinanced, exploring HELOC acceleration',
 320000.00, 0.0625, 360, 1950.00, 100000.00, 0.0750, 100000.00,
 8500.00, 6200.00, 4200.00, 2000.00, 425000.00, 520.00, 150.00, 0.00,
 360, 182000.00, 216, 105800.00, 144, 76200.00),

-- John@example.com - Mid-Career Professional
((SELECT id FROM users WHERE email = 'john@example.com'),
 'Mid-Career Acceleration', 'Established professional with stable income',
 425000.00, 0.0700, 312, 2850.00, 125000.00, 0.0800, 125000.00,
 9800.00, 7200.00, 5200.00, 2000.00, 550000.00, 680.00, 200.00, 150.00,
 312, 264200.00, 186, 152400.00, 126, 111800.00),

-- Jane@example.com - Young Professional
((SELECT id FROM users WHERE email = 'jane@example.com'),
 'Young Professional Condo', 'Recent graduate with growing income',
 245000.00, 0.0650, 360, 1580.00, 60000.00, 0.0775, 60000.00,
 6800.00, 5100.00, 3600.00, 1500.00, 295000.00, 380.00, 95.00, 220.00,
 360, 123800.00, 204, 71200.00, 156, 52600.00);

-- Assign agents to users
INSERT INTO user_agent_assignments (user_id, agent_id, assignment_type, notes)
VALUES 
-- Assign John Smith to demo user
((SELECT id FROM users WHERE email = 'demo@helocaccelerator.com'),
 (SELECT id FROM agents WHERE email = 'john.smith@helocaccelerator.com'),
 'primary', 'Demo account for testing HELOC acceleration strategies'),

-- Assign Sarah Johnson to john@example.com
((SELECT id FROM users WHERE email = 'john@example.com'),
 (SELECT id FROM agents WHERE email = 'sarah.johnson@helocaccelerator.com'),
 'primary', 'Mid-career professional seeking mortgage optimization'),

-- Assign John Smith to jane@example.com
((SELECT id FROM users WHERE email = 'jane@example.com'),
 (SELECT id FROM agents WHERE email = 'john.smith@helocaccelerator.com'),
 'primary', 'Young professional with first-time buyer scenario')

ON CONFLICT (user_id, assignment_type) DO NOTHING;

-- Track scenario creation by agents
INSERT INTO scenario_agent_tracking (scenario_id, agent_id, interaction_type, notes)
SELECT 
    s.id,
    ua.agent_id,
    'created',
    'Initial scenario setup for client'
FROM scenarios s
JOIN users u ON s.user_id = u.id
JOIN user_agent_assignments ua ON u.id = ua.user_id
WHERE u.email IN ('demo@helocaccelerator.com', 'john@example.com', 'jane@example.com')
AND s.created_at > NOW() - INTERVAL '1 minute'; -- Only track scenarios just created
