/**
 * TypeScript interfaces for the Dynamic Mortgage Acceleration Budgeting Tool
 * Extends existing HELOC Accelerator types with budgeting functionality
 */

// Base interfaces extending existing types
export interface BudgetScenario {
  id: string;
  scenarioId: string; // References existing scenarios table
  name: string;
  description?: string;

  // Base Income/Expense Data
  baseMonthlyGrossIncome: number;
  baseMonthlyNetIncome: number;
  baseMonthlyExpenses: number;

  // Calculated Fields
  baseDiscretionaryIncome: number;
  recommendedPrincipalPayment: number;
  customPrincipalPayment?: number;

  // Configuration
  principalMultiplier: number;
  autoAdjustPayments: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  isActive: boolean;

  // Related data (populated when needed)
  incomeScenarios?: IncomeScenario[];
  expenseScenarios?: ExpenseScenario[];
  calculationResults?: BudgetCalculationResult[];
}

export interface IncomeScenario {
  id: string;
  budgetScenarioId: string;
  name: string;
  description?: string;

  // Scenario Details
  scenarioType: IncomeScenarioType;
  amount: number;

  // Timing
  startMonth: number;
  endMonth?: number; // null for permanent changes
  frequency: ScenarioFrequency;

  // Configuration
  isActive: boolean;
  isRecurring: boolean;
  taxRate: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseScenario {
  id: string;
  budgetScenarioId: string;
  name: string;
  description?: string;

  // Expense Details
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;

  // Timing
  startMonth: number;
  endMonth?: number;
  frequency: ScenarioFrequency;

  // Configuration
  isActive: boolean;
  isRecurring: boolean;
  isEssential: boolean;
  priorityLevel: number; // 1-10 scale

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCalculationResult {
  id: string;
  budgetScenarioId: string;
  monthNumber: number;

  // Monthly Income/Expense Breakdown
  monthlyGrossIncome: number;
  monthlyNetIncome: number;
  monthlyExpenses: number;
  discretionaryIncome: number;

  // Payment Calculations
  recommendedPrincipalPayment: number;
  actualPrincipalPayment: number;
  paymentAdjustmentReason?: string;

  // Mortgage Details
  beginningMortgageBalance: number;
  endingMortgageBalance: number;
  mortgagePayment: number;
  mortgageInterest: number;
  mortgagePrincipal: number;

  // HELOC Details
  beginningHelocBalance: number;
  endingHelocBalance: number;
  helocPayment: number;
  helocInterest: number;
  helocPrincipal: number;

  // PMI Tracking
  pmiPayment: number;
  currentLtv: number;
  pmiEliminated: boolean;

  // Cumulative Totals
  cumulativeInterestPaid: number;
  cumulativePrincipalPaid: number;
  cumulativeInterestSaved: number;
  cumulativeTimeSavedMonths: number;

  // Cash Flow Analysis
  totalMonthlyOutflow: number;
  remainingCashFlow: number;
  cashFlowStressRatio: number;

  // Metadata
  calculationTimestamp: string;
  calculationVersion: string;
}

export interface BudgetScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;

  // Template Data
  incomeTemplate: Partial<IncomeScenario>[];
  expenseTemplate: Partial<ExpenseScenario>[];
  scenarioTemplate: Record<string, any>;

  // Configuration
  isPublic: boolean;
  isActive: boolean;
  usageCount: number;

  // Metadata
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Enums and Union Types
export type IncomeScenarioType =
  | "raise"
  | "bonus"
  | "job_loss"
  | "side_income"
  | "investment_income"
  | "overtime"
  | "commission"
  | "rental_income"
  | "other";

export type ExpenseCategory =
  | "housing"
  | "utilities"
  | "food"
  | "transportation"
  | "insurance"
  | "debt"
  | "discretionary"
  | "emergency"
  | "healthcare"
  | "education"
  | "childcare"
  | "entertainment"
  | "other";

export type ScenarioFrequency =
  | "monthly"
  | "quarterly"
  | "annually"
  | "one_time";

// API Request/Response Types
export interface CreateBudgetScenarioRequest {
  scenarioId: string;
  name: string;
  description?: string;
  baseMonthlyGrossIncome: number;
  baseMonthlyNetIncome: number;
  baseMonthlyExpenses: number;
  customPrincipalPayment?: number;
  principalMultiplier?: number;
  autoAdjustPayments?: boolean;
}

export interface CreateIncomeScenarioRequest {
  name: string;
  description?: string;
  scenarioType: IncomeScenarioType;
  amount: number;
  startMonth: number;
  endMonth?: number;
  frequency: ScenarioFrequency;
  isRecurring?: boolean;
  taxRate?: number;
}

export interface CreateExpenseScenarioRequest {
  name: string;
  description?: string;
  category: ExpenseCategory;
  subcategory?: string;
  amount: number;
  startMonth: number;
  endMonth?: number;
  frequency: ScenarioFrequency;
  isRecurring?: boolean;
  isEssential?: boolean;
  priorityLevel?: number;
}

export interface CalculationRequest {
  includeScenarios?: string[];
  monthsToProject?: number;
  recalculateAll?: boolean;
}

export interface CalculationSummary {
  totalMonths: number;
  totalInterestSaved: number;
  pmiEliminationMonth: number;
  maxDiscretionaryIncome: number;
  minDiscretionaryIncome: number;
  averageDiscretionaryIncome: number;
  traditionalPayoffMonths: number;
  budgetingPayoffMonths: number;
  monthsSaved: number;
}

export interface CalculationResponse {
  calculationId: string;
  budgetScenarioId: string;
  summary: CalculationSummary;
  monthlyResults: BudgetCalculationResult[];
}

export interface LiveCalculationRequest {
  baseIncome: number;
  baseExpenses: number;
  mortgageDetails: {
    principal: number;
    annualInterestRate: number;
    termInMonths: number;
    monthlyPayment: number;
    propertyValue?: number;
    pmiMonthly?: number;
  };
  helocDetails?: {
    helocLimit: number;
    helocRate: number;
    helocAvailableCredit: number;
  };
  scenarios: Array<{
    type: "income" | "expense";
    amount: number;
    startMonth: number;
    endMonth?: number;
    frequency: ScenarioFrequency;
  }>;
  monthsToProject: number;
  principalMultiplier?: number;
}

export interface LiveCalculationResponse {
  discretionaryIncome: number;
  recommendedPrincipalPayment: number;
  projectedPayoffMonths: number;
  projectedInterestSaved: number;
  pmiEliminationMonth: number;
  monthlyBreakdown: Array<{
    monthNumber: number;
    discretionaryIncome: number;
    principalPayment: number;
    mortgageBalance: number;
    interestSaved: number;
  }>;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: Array<{
    field: string;
    message: string;
    suggestedValue?: any;
  }>;
}

// Chart and Visualization Types
export interface ChartDataPoint {
  month: number;
  value: number;
  label?: string;
  category?: string;
}

export interface PayoffTimelineData {
  traditionalPayoff: ChartDataPoint[];
  budgetingPayoff: ChartDataPoint[];
  scenarios: Array<{
    month: number;
    type: "income" | "expense";
    name: string;
    amount: number;
  }>;
}

export interface DiscretionaryIncomeData {
  baseline: ChartDataPoint[];
  withScenarios: ChartDataPoint[];
  scenarios: Array<{
    startMonth: number;
    endMonth?: number;
    impact: number;
    name: string;
  }>;
}

// Component Props Types
export interface BudgetingDashboardProps {
  scenarioId: string;
  initialData?: BudgetScenario;
  onDataChange?: (data: BudgetScenario) => void;
}

export interface IncomeExpenseFormProps {
  budgetScenarioId: string;
  initialIncome?: number;
  initialExpenses?: number;
  onCalculationUpdate: (result: LiveCalculationResponse) => void;
  onSave?: (data: CreateBudgetScenarioRequest) => void;
}

export interface ScenarioBuilderProps {
  budgetScenarioId: string;
  type: "income" | "expense";
  onScenarioCreate: (scenario: IncomeScenario | ExpenseScenario) => void;
  onCancel?: () => void;
}

export interface PayoffTimelineChartProps {
  data: PayoffTimelineData;
  height?: number;
  showScenarioMarkers?: boolean;
  onMonthHover?: (month: number, data: any) => void;
}

export interface DiscretionaryIncomeChartProps {
  data: DiscretionaryIncomeData;
  height?: number;
  showTrendLine?: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
}

// Utility Types
export type BudgetScenarioWithRelations = BudgetScenario & {
  incomeScenarios: IncomeScenario[];
  expenseScenarios: ExpenseScenario[];
  calculationResults: BudgetCalculationResult[];
};

export type ScenarioImpactAnalysis = {
  scenarioId: string;
  scenarioName: string;
  type: "income" | "expense";
  monthlyImpact: number;
  totalImpact: number;
  payoffImpact: number; // months saved/added
  interestImpact: number; // interest saved/added
};

// Integration with existing types
export interface ExtendedScenario extends BudgetScenario {
  // Extends the existing scenario type with budgeting capabilities
  hasBudgetingEnabled: boolean;
  defaultPrincipalMultiplier: number;
  budgetScenarioCount: number;
}

// All types are already exported as interfaces above
