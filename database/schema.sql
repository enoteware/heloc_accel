-- HELOC Accelerator Database Schema
-- PostgreSQL Database Schema for HELOC Accelerator Application

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    date_of_birth DATE,
    age_range VARCHAR(50),
    household_size INTEGER,
    marital_status VARCHAR(50),
    dependents INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE
);

-- Scenarios table for storing user calculation scenarios
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Mortgage Information
    current_mortgage_balance DECIMAL(12,2) NOT NULL,
    current_interest_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.0650 for 6.5%
    remaining_term_months INTEGER NOT NULL,
    monthly_payment DECIMAL(10,2) NOT NULL,

    -- HELOC Information
    heloc_limit DECIMAL(12,2),
    heloc_interest_rate DECIMAL(5,4), -- e.g., 0.0750 for 7.5%
    heloc_available_credit DECIMAL(12,2),

    -- Income and Expenses
    monthly_gross_income DECIMAL(10,2) NOT NULL,
    monthly_net_income DECIMAL(10,2) NOT NULL,
    monthly_expenses DECIMAL(10,2) NOT NULL,
    monthly_discretionary_income DECIMAL(10,2) NOT NULL,

    -- Property Information
    property_value DECIMAL(12,2),
    property_tax_monthly DECIMAL(8,2),
    insurance_monthly DECIMAL(8,2),
    hoa_fees_monthly DECIMAL(8,2) DEFAULT 0,

    -- Calculation Results (stored for quick access)
    traditional_payoff_months INTEGER,
    traditional_total_interest DECIMAL(12,2),
    heloc_payoff_months INTEGER,
    heloc_total_interest DECIMAL(12,2),
    time_saved_months INTEGER,
    interest_saved DECIMAL(12,2),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT false, -- for sharing scenarios
    public_share_token VARCHAR(255) UNIQUE
);

-- Calculation results table for detailed month-by-month breakdown
CREATE TABLE calculation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN ('traditional', 'heloc')),
    month_number INTEGER NOT NULL,

    -- Monthly breakdown
    beginning_balance DECIMAL(12,2) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    principal_payment DECIMAL(10,2) NOT NULL,
    interest_payment DECIMAL(10,2) NOT NULL,
    ending_balance DECIMAL(12,2) NOT NULL,

    -- HELOC specific fields
    heloc_balance DECIMAL(12,2) DEFAULT 0,
    heloc_payment DECIMAL(10,2) DEFAULT 0,
    heloc_interest DECIMAL(10,2) DEFAULT 0,

    -- Cumulative totals
    cumulative_interest DECIMAL(12,2) NOT NULL,
    cumulative_principal DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table for NextAuth.js
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User accounts table for OAuth providers (NextAuth.js)
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- Audit log table for tracking changes
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at);
CREATE INDEX idx_scenarios_public_share_token ON scenarios(public_share_token) WHERE public_share_token IS NOT NULL;
CREATE INDEX idx_calculation_results_scenario_id ON calculation_results(scenario_id);
CREATE INDEX idx_calculation_results_type_month ON calculation_results(scenario_id, calculation_type, month_number);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: 'admin123' - should be changed in production)
INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified)
VALUES (
    'admin@helocaccel.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', -- bcrypt hash of 'admin123'
    'Admin',
    'User',
    true,
    true
);

-- Create a sample scenario for testing
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
    insurance_monthly
) VALUES (
    (SELECT id FROM users WHERE email = 'admin@helocaccel.com'),
    'Sample HELOC Analysis',
    'Example scenario showing HELOC acceleration vs traditional mortgage',
    350000.00,
    0.0650, -- 6.5%
    300, -- 25 years remaining
    2200.00,
    100000.00,
    0.0750, -- 7.5%
    100000.00,
    8500.00,
    6800.00,
    4500.00,
    2300.00,
    500000.00,
    850.00,
    250.00
);