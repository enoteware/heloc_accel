-- Company and Agent Data Schema (Fixed for existing database)
-- This schema stores company information and agent profiles
-- that can be displayed on web pages and PDF reports

-- Company Settings Table
-- Stores global company information
CREATE TABLE IF NOT EXISTS company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    company_address TEXT,
    company_phone VARCHAR(50),
    company_email VARCHAR(255),
    company_website VARCHAR(255),
    company_license_number VARCHAR(100),
    company_nmls_number VARCHAR(100), -- Nationwide Multistate Licensing System number
    company_description TEXT,
    primary_color VARCHAR(7), -- Hex color for branding
    secondary_color VARCHAR(7), -- Hex color for branding
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Agents/Loan Officers Table
-- Stores information about individual agents
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to existing users table
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100), -- e.g., "Senior Loan Officer", "Mortgage Specialist"
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    phone_extension VARCHAR(10),
    mobile_phone VARCHAR(50),
    profile_image_url TEXT,
    bio TEXT,
    nmls_number VARCHAR(100), -- Individual NMLS number
    license_states TEXT[], -- Array of state abbreviations where licensed
    specialties TEXT[], -- Array of specialties: "HELOC", "FHA", "VA", etc.
    years_experience INTEGER,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0, -- For ordering agents in lists
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Agent Availability Table
-- Stores agent availability for scheduling
CREATE TABLE IF NOT EXISTS agent_availability (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, day_of_week)
);

-- Company Documents Table
-- Stores important documents and disclosures
CREATE TABLE IF NOT EXISTS company_documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'disclosure', etc.
    title VARCHAR(255) NOT NULL,
    content TEXT,
    pdf_url TEXT,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20),
    effective_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User-Agent Assignment Table
-- Links users to their assigned agents
CREATE TABLE IF NOT EXISTS user_agent_assignments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Reference existing users table
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assignment_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'temporary'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, assignment_type)
);

-- Scenario-Agent Tracking Table
-- Tracks which agent helped with which scenario
CREATE TABLE IF NOT EXISTS scenario_agent_tracking (
    id SERIAL PRIMARY KEY,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE, -- Use UUID to match scenarios table
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50), -- 'created', 'reviewed', 'modified'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_user_agent_assignments_user_id ON user_agent_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_assignments_agent_id ON user_agent_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_scenario_agent_tracking_scenario_id ON scenario_agent_tracking(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_agent_tracking_agent_id ON scenario_agent_tracking(agent_id);

-- Create update timestamp trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_availability_updated_at ON agent_availability;
CREATE TRIGGER update_agent_availability_updated_at BEFORE UPDATE ON agent_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_documents_updated_at ON company_documents;
CREATE TRIGGER update_company_documents_updated_at BEFORE UPDATE ON company_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_agent_assignments_updated_at ON user_agent_assignments;
CREATE TRIGGER update_user_agent_assignments_updated_at BEFORE UPDATE ON user_agent_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default company settings
INSERT INTO company_settings (
    company_name,
    company_email,
    company_phone,
    company_description,
    primary_color,
    secondary_color
) VALUES (
    'HELOC Accelerator',
    'info@helocaccelerator.com',
    '1-800-HELOC-01',
    'Your trusted partner in mortgage acceleration strategies',
    '#2563eb', -- Blue
    '#10b981'  -- Green
) ON CONFLICT DO NOTHING;

-- Insert sample agent (for demo/development)
INSERT INTO agents (
    first_name,
    last_name,
    title,
    email,
    phone,
    bio,
    specialties,
    years_experience,
    is_active
) VALUES (
    'John',
    'Smith',
    'Senior Mortgage Advisor',
    'john.smith@helocaccelerator.com',
    '555-0100',
    'With over 10 years of experience in mortgage acceleration strategies, John specializes in helping homeowners save thousands in interest payments.',
    ARRAY['HELOC', 'Mortgage Refinancing', 'Debt Consolidation'],
    10,
    true
) ON CONFLICT DO NOTHING;
