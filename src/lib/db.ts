import { Pool } from "pg";

// Create a connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Export the pool for use in API routes
export default pool;

// Helper function to get a client from the pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// Helper function for transactions
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Type definitions for database records
export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface DbScenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;

  // Mortgage fields
  current_mortgage_balance: number;
  current_interest_rate: number;
  remaining_term_months: number;
  monthly_payment: number;

  // HELOC fields
  heloc_limit?: number;
  heloc_interest_rate?: number;
  heloc_available_credit?: number;

  // Income fields
  monthly_gross_income: number;
  monthly_net_income: number;
  monthly_expenses: number;
  monthly_discretionary_income: number;

  // Property fields
  property_value?: number;
  property_tax_monthly?: number;
  insurance_monthly?: number;
  hoa_fees_monthly?: number;
  pmi_monthly?: number;

  // Results summary
  traditional_payoff_months?: number;
  traditional_total_interest?: number;
  traditional_monthly_payment?: number;
  traditional_total_payments?: number;
  heloc_payoff_months?: number;
  heloc_total_interest?: number;
  heloc_max_used?: number;
  heloc_average_balance?: number;
  heloc_total_mortgage_interest?: number;
  heloc_total_heloc_interest?: number;
  time_saved_months?: number;
  time_saved_years?: number;
  interest_saved?: number;
  percentage_interest_saved?: number;

  // JSON fields for complete data
  calculation_results_json?: any;
  heloc_schedule_json?: any;

  // Metadata
  created_at: Date;
  updated_at: Date;
  is_public?: boolean;
  public_share_token?: string;
}
