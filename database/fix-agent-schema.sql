-- Fix Agent Schema for Current Database
-- This creates agent tables compatible with our existing schema

-- Agents/Loan Officers Table
-- Stores information about individual agents
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user account if applicable
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

-- User-Agent Assignment Table
-- Links users to their assigned agents
CREATE TABLE IF NOT EXISTS user_agent_assignments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assignment_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'temporary'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, assignment_type)
);

-- Scenario-Agent Tracking Table (using UUID for scenario_id to match our schema)
-- Tracks which agent helped with which scenario
CREATE TABLE IF NOT EXISTS scenario_agent_tracking (
    id SERIAL PRIMARY KEY,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
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

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_availability_updated_at 
    BEFORE UPDATE ON agent_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agent_assignments_updated_at 
    BEFORE UPDATE ON user_agent_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Insert another sample agent
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
    'Sarah',
    'Johnson',
    'HELOC Specialist',
    'sarah.johnson@helocaccelerator.com',
    '555-0101',
    'Sarah has 8 years of experience helping clients leverage home equity for debt consolidation and mortgage acceleration.',
    ARRAY['HELOC', 'Home Equity', 'Financial Planning'],
    8,
    true
) ON CONFLICT DO NOTHING;
