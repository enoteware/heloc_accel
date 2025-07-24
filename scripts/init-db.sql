-- Additional initialization for Docker setup
-- This file runs after schema.sql in Docker

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE heloc_accelerator TO heloc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO heloc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO heloc_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO heloc_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO heloc_user;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_user_id_created_at ON scenarios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculation_results_scenario_type ON calculation_results(scenario_id, calculation_type);

-- Insert additional test data if needed
DO $$
BEGIN
    -- Only insert if no scenarios exist yet
    IF NOT EXISTS (SELECT 1 FROM scenarios LIMIT 1) THEN
        -- Additional test scenarios can be added here
        RAISE NOTICE 'Database initialized with schema and default data';
    END IF;
END $$;
