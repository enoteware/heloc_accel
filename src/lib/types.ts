// Database model types for HELOC Accelerator

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: Date;
  age_range?: string;
  household_size?: number;
  marital_status?: string;
  dependents?: number;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;

  // Mortgage Information
  current_mortgage_balance: number;
  current_interest_rate: number;
  remaining_term_months: number;
  monthly_payment: number;

  // HELOC Information
  heloc_limit?: number;
  heloc_interest_rate?: number;
  heloc_available_credit?: number;

  // Income and Expenses
  monthly_gross_income: number;
  monthly_net_income: number;
  monthly_expenses: number;
  monthly_discretionary_income: number;

  // Property Information
  property_value?: number;
  property_tax_monthly?: number;
  insurance_monthly?: number;
  hoa_fees_monthly?: number;

  // Calculation Results
  traditional_payoff_months?: number;
  traditional_total_interest?: number;
  heloc_payoff_months?: number;
  heloc_total_interest?: number;
  time_saved_months?: number;
  interest_saved?: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
  is_public: boolean;
  public_share_token?: string;
}

export interface CalculationResult {
  id: string;
  scenario_id: string;
  calculation_type: "traditional" | "heloc";
  month_number: number;

  // Monthly breakdown
  beginning_balance: number;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  ending_balance: number;

  // HELOC specific fields
  heloc_balance?: number;
  heloc_payment?: number;
  heloc_interest?: number;

  // Cumulative totals
  cumulative_interest: number;
  cumulative_principal: number;

  created_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires: Date;
  created_at: Date;
}

export interface UserAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  provider_type: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: Date;
  token_type?: string;
  scope?: string;
  id_token?: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Input types for creating/updating records
export interface CreateUserInput {
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  last_login?: Date;
  is_active?: boolean;
}

export interface CreateScenarioInput {
  user_id: string;
  name: string;
  description?: string;
  current_mortgage_balance: number;
  current_interest_rate: number;
  remaining_term_months: number;
  monthly_payment: number;
  heloc_limit?: number;
  heloc_interest_rate?: number;
  heloc_available_credit?: number;
  monthly_gross_income: number;
  monthly_net_income: number;
  monthly_expenses: number;
  monthly_discretionary_income: number;
  property_value?: number;
  property_tax_monthly?: number;
  insurance_monthly?: number;
  hoa_fees_monthly?: number;
}

export interface UpdateScenarioInput {
  name?: string;
  description?: string;
  current_mortgage_balance?: number;
  current_interest_rate?: number;
  remaining_term_months?: number;
  monthly_payment?: number;
  heloc_limit?: number;
  heloc_interest_rate?: number;
  heloc_available_credit?: number;
  monthly_gross_income?: number;
  monthly_net_income?: number;
  monthly_expenses?: number;
  monthly_discretionary_income?: number;
  property_value?: number;
  property_tax_monthly?: number;
  insurance_monthly?: number;
  hoa_fees_monthly?: number;
  traditional_payoff_months?: number;
  traditional_total_interest?: number;
  heloc_payoff_months?: number;
  heloc_total_interest?: number;
  time_saved_months?: number;
  interest_saved?: number;
  is_public?: boolean;
  public_share_token?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Calculation input types
export interface CalculationInput {
  current_mortgage_balance: number;
  current_interest_rate: number;
  remaining_term_months: number;
  monthly_payment: number;
  heloc_limit?: number;
  heloc_interest_rate?: number;
  monthly_discretionary_income: number;
}

export interface CalculationOutput {
  traditional: {
    payoff_months: number;
    total_interest: number;
    monthly_breakdown: MonthlyBreakdown[];
  };
  heloc: {
    payoff_months: number;
    total_interest: number;
    monthly_breakdown: MonthlyBreakdown[];
  };
  comparison: {
    time_saved_months: number;
    interest_saved: number;
    percentage_interest_saved: number;
  };
}

export interface MonthlyBreakdown {
  month: number;
  beginning_balance: number;
  payment_amount: number;
  principal_payment: number;
  interest_payment: number;
  ending_balance: number;
  cumulative_interest: number;
  cumulative_principal: number;
  // HELOC specific
  heloc_balance?: number;
  heloc_payment?: number;
  heloc_interest?: number;
}
