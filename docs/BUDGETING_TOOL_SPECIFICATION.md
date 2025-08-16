# Dynamic Mortgage Acceleration Budgeting Tool - Technical Specification

## 1. Executive Summary

This document outlines the comprehensive plan for developing a dynamic mortgage acceleration budgeting tool within the existing HELOC Accelerator application. The tool will provide clients with an interactive interface to optimize their mortgage payoff strategy using advanced discretionary income calculations and scenario modeling.

## 2. Project Context and Integration

### 2.1 Existing Architecture

- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: NextAuth.js with demo mode support
- **UI**: Tailwind CSS with semantic theme tokens
- **Existing Features**: HELOC acceleration calculations, scenario management, user dashboard

### 2.2 Integration Points

- Extend existing `scenarios` table with budgeting fields
- Build upon current calculation engine in `src/lib/calculations.ts`
- Integrate with existing authentication and user management
- Maintain consistency with current UI/UX patterns
- Leverage existing API patterns and validation systems

## 3. Core Functionality Requirements

### 3.1 Discretionary Income Engine

#### 3.1.1 Calculation Logic

```typescript
interface DiscretionaryIncomeCalculation {
  monthlyGrossIncome: number;
  monthlyNetIncome: number;
  monthlyExpenses: number;
  discretionaryIncome: number; // Net Income - Expenses
  recommendedPrincipalPayment: number; // 3x discretionary income
  customPrincipalPayment?: number; // User override
}
```

#### 3.1.2 Real-time Recalculation

- Automatic updates when income/expense inputs change
- Debounced calculations for performance
- Visual feedback for calculation updates
- Validation of input ranges and logical consistency

#### 3.1.3 Historical Tracking

- Store calculation history for authenticated users
- Track changes over time
- Compare different time periods
- Export historical data

### 3.2 Dynamic Payment Adjustment System

#### 3.2.1 Payment Strategy Logic

- **Base Strategy**: 3x discretionary income as initial principal payment
- **HELOC Integration**: Additional payments when HELOC balance reaches zero
- **Manual Override**: Allow custom payment amounts with impact analysis
- **Automatic Adjustment**: Recalculate based on income/expense changes

#### 3.2.2 Payment Optimization

- Analyze optimal payment timing
- Consider HELOC vs mortgage interest rate differentials
- Factor in PMI elimination timeline
- Account for cash flow constraints

### 3.3 Scenario Modeling & Analysis

#### 3.3.1 Income Scenario Types

```typescript
interface IncomeScenario {
  id: string;
  name: string;
  type: "raise" | "bonus" | "job_loss" | "side_income" | "investment_income";
  amount: number;
  startMonth: number;
  endMonth?: number; // null for permanent changes
  frequency: "monthly" | "quarterly" | "annually" | "one_time";
}
```

#### 3.3.2 Expense Scenario Types

```typescript
interface ExpenseScenario {
  id: string;
  name: string;
  category:
    | "housing"
    | "utilities"
    | "food"
    | "transportation"
    | "insurance"
    | "debt"
    | "discretionary"
    | "emergency";
  amount: number;
  startMonth: number;
  endMonth?: number;
  frequency: "monthly" | "quarterly" | "annually" | "one_time";
  isRecurring: boolean;
}
```

#### 3.3.3 Impact Analysis

- Mortgage payoff timeline changes (years/months saved)
- PMI elimination date adjustments
- Total interest savings calculations
- Cash flow impact projections
- Risk assessment for different scenarios

## 4. Database Schema Extensions

### 4.1 New Tables

#### 4.1.1 Budget Scenarios Table

```sql
CREATE TABLE budget_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Base Income/Expense Data
    base_monthly_gross_income DECIMAL(10,2) NOT NULL,
    base_monthly_net_income DECIMAL(10,2) NOT NULL,
    base_monthly_expenses DECIMAL(10,2) NOT NULL,

    -- Calculated Fields
    base_discretionary_income DECIMAL(10,2) NOT NULL,
    recommended_principal_payment DECIMAL(10,2) NOT NULL,
    custom_principal_payment DECIMAL(10,2),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### 4.1.2 Income Scenarios Table

```sql
CREATE TABLE income_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL CHECK (scenario_type IN ('raise', 'bonus', 'job_loss', 'side_income', 'investment_income')),
    amount DECIMAL(10,2) NOT NULL,
    start_month INTEGER NOT NULL,
    end_month INTEGER, -- NULL for permanent changes
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annually', 'one_time')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.3 Expense Scenarios Table

```sql
CREATE TABLE expense_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('housing', 'utilities', 'food', 'transportation', 'insurance', 'debt', 'discretionary', 'emergency')),
    amount DECIMAL(10,2) NOT NULL,
    start_month INTEGER NOT NULL,
    end_month INTEGER,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annually', 'one_time')),
    is_recurring BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.4 Budget Calculation Results Table

```sql
CREATE TABLE budget_calculation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_scenario_id UUID NOT NULL REFERENCES budget_scenarios(id) ON DELETE CASCADE,
    month_number INTEGER NOT NULL,

    -- Monthly Income/Expense Breakdown
    monthly_gross_income DECIMAL(10,2) NOT NULL,
    monthly_net_income DECIMAL(10,2) NOT NULL,
    monthly_expenses DECIMAL(10,2) NOT NULL,
    discretionary_income DECIMAL(10,2) NOT NULL,

    -- Payment Calculations
    recommended_principal_payment DECIMAL(10,2) NOT NULL,
    actual_principal_payment DECIMAL(10,2) NOT NULL,

    -- Mortgage Details
    mortgage_balance DECIMAL(12,2) NOT NULL,
    mortgage_payment DECIMAL(10,2) NOT NULL,
    mortgage_interest DECIMAL(10,2) NOT NULL,
    mortgage_principal DECIMAL(10,2) NOT NULL,

    -- HELOC Details
    heloc_balance DECIMAL(12,2) DEFAULT 0,
    heloc_payment DECIMAL(10,2) DEFAULT 0,
    heloc_interest DECIMAL(10,2) DEFAULT 0,

    -- PMI Tracking
    pmi_payment DECIMAL(8,2) DEFAULT 0,
    current_ltv DECIMAL(5,2),
    pmi_eliminated BOOLEAN DEFAULT false,

    -- Cumulative Totals
    cumulative_interest_saved DECIMAL(12,2) NOT NULL,
    cumulative_time_saved_months INTEGER NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Existing Table Extensions

#### 4.2.1 Scenarios Table Additions

```sql
-- Add budgeting-specific fields to existing scenarios table
ALTER TABLE scenarios ADD COLUMN has_budgeting_enabled BOOLEAN DEFAULT false;
ALTER TABLE scenarios ADD COLUMN default_principal_multiplier DECIMAL(3,1) DEFAULT 3.0;
ALTER TABLE scenarios ADD COLUMN budget_scenario_count INTEGER DEFAULT 0;
```

## 5. API Endpoint Design

### 5.1 Budget Scenarios Endpoints

#### 5.1.1 Core CRUD Operations

```typescript
// GET /api/budget-scenarios?scenarioId={id}
// POST /api/budget-scenarios
// PUT /api/budget-scenarios/{id}
// DELETE /api/budget-scenarios/{id}

interface BudgetScenarioRequest {
  scenarioId: string;
  name: string;
  description?: string;
  baseMonthlyGrossIncome: number;
  baseMonthlyNetIncome: number;
  baseMonthlyExpenses: number;
  customPrincipalPayment?: number;
}

interface BudgetScenarioResponse {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;
  baseDiscretionaryIncome: number;
  recommendedPrincipalPayment: number;
  customPrincipalPayment?: number;
  incomeScenarios: IncomeScenario[];
  expenseScenarios: ExpenseScenario[];
  calculationSummary: {
    payoffMonthsTraditional: number;
    payoffMonthsWithBudgeting: number;
    monthsSaved: number;
    interestSaved: number;
    pmiEliminationMonth: number;
  };
}
```

#### 5.1.2 Calculation Endpoints

```typescript
// POST /api/budget-scenarios/{id}/calculate
// GET /api/budget-scenarios/{id}/results

interface CalculationRequest {
  includeScenarios?: string[]; // Array of scenario IDs to include
  monthsToProject?: number; // Default 360 (30 years)
}

interface CalculationResponse {
  budgetScenarioId: string;
  monthlyResults: BudgetCalculationResult[];
  summary: {
    totalMonths: number;
    totalInterestSaved: number;
    pmiEliminationMonth: number;
    maxDiscretionaryIncome: number;
    minDiscretionaryIncome: number;
    averageDiscretionaryIncome: number;
  };
}
```

### 5.2 Income/Expense Scenario Endpoints

#### 5.2.1 Income Scenarios

```typescript
// GET /api/budget-scenarios/{id}/income-scenarios
// POST /api/budget-scenarios/{id}/income-scenarios
// PUT /api/income-scenarios/{id}
// DELETE /api/income-scenarios/{id}
```

#### 5.2.2 Expense Scenarios

```typescript
// GET /api/budget-scenarios/{id}/expense-scenarios
// POST /api/budget-scenarios/{id}/expense-scenarios
// PUT /api/expense-scenarios/{id}
// DELETE /api/expense-scenarios/{id}
```

### 5.3 Real-time Calculation Endpoints

#### 5.3.1 Live Calculation Updates

```typescript
// POST /api/budget-scenarios/calculate-live
interface LiveCalculationRequest {
  baseIncome: number;
  baseExpenses: number;
  mortgageDetails: MortgageInput;
  helocDetails?: HELOCInput;
  scenarios: (IncomeScenario | ExpenseScenario)[];
  monthsToProject: number;
}

interface LiveCalculationResponse {
  discretionaryIncome: number;
  recommendedPrincipalPayment: number;
  projectedPayoffMonths: number;
  projectedInterestSaved: number;
  pmiEliminationMonth: number;
  monthlyBreakdown: BudgetCalculationResult[];
}
```

## 6. Component Architecture

### 6.1 Main Budgeting Interface Components

#### 6.1.1 BudgetingDashboard Component

```typescript
interface BudgetingDashboardProps {
  scenarioId: string;
  initialData?: BudgetScenarioResponse;
}

// Features:
// - Real-time discretionary income display
// - Recommended vs custom principal payment toggle
// - Quick scenario creation
// - Summary metrics cards
// - Navigation to detailed views
```

#### 6.1.2 IncomeExpenseForm Component

```typescript
interface IncomeExpenseFormProps {
  budgetScenarioId: string;
  initialIncome?: number;
  initialExpenses?: number;
  onCalculationUpdate: (result: LiveCalculationResponse) => void;
}

// Features:
// - Categorized expense inputs
// - Multiple income source support
// - Real-time validation
// - Auto-save functionality
// - Visual feedback for changes
```

#### 6.1.3 ScenarioModeling Component

```typescript
interface ScenarioModelingProps {
  budgetScenarioId: string;
  existingScenarios: (IncomeScenario | ExpenseScenario)[];
  onScenariosChange: (scenarios: any[]) => void;
}

// Features:
// - Drag-and-drop scenario timeline
// - Scenario templates (raise, emergency, etc.)
// - Impact preview
// - Scenario comparison
// - What-if analysis tools
```

### 6.2 Visualization Components

#### 6.2.1 PayoffTimelineChart Component

```typescript
interface PayoffTimelineChartProps {
  traditionalPayoff: number;
  budgetingPayoff: number;
  scenarios: (IncomeScenario | ExpenseScenario)[];
  monthlyResults: BudgetCalculationResult[];
}

// Features:
// - Interactive timeline with scenario markers
// - Before/after comparison
// - Hover details for specific months
// - PMI elimination highlighting
// - Export functionality
```

#### 6.2.2 DiscretionaryIncomeChart Component

```typescript
interface DiscretionaryIncomeChartProps {
  monthlyResults: BudgetCalculationResult[];
  scenarios: (IncomeScenario | ExpenseScenario)[];
}

// Features:
// - Line chart of discretionary income over time
// - Scenario impact visualization
// - Trend analysis
// - Statistical summaries
```

### 6.3 Form and Input Components

#### 6.3.1 CategorizedExpenseInput Component

```typescript
interface CategorizedExpenseInputProps {
  category: ExpenseCategory;
  value: number;
  onChange: (value: number) => void;
  validation?: ValidationRule[];
}

// Features:
// - Category-specific validation
// - Helpful tooltips and examples
// - Currency formatting
// - Accessibility compliance
```

#### 6.3.2 ScenarioBuilder Component

```typescript
interface ScenarioBuilderProps {
  type: "income" | "expense";
  onScenarioCreate: (scenario: IncomeScenario | ExpenseScenario) => void;
}

// Features:
// - Step-by-step scenario creation
// - Template selection
// - Impact preview
// - Validation and error handling
```

## 7. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)

- Database schema design and migration
- Core calculation engine extensions
- Basic API endpoints for budget scenarios

### Phase 2: Core Functionality (Weeks 3-4)

- Income/expense scenario management
- Real-time calculation engine
- Basic UI components for data input

### Phase 3: Advanced Features (Weeks 5-6)

- Scenario modeling and what-if analysis
- Advanced visualization components
- Dashboard integration

### Phase 4: Polish and Testing (Weeks 7-8)

- Comprehensive testing suite
- Performance optimization
- User experience refinements
- Documentation completion

## 8. Success Metrics

### 8.1 Technical Metrics

- Sub-second response time for real-time calculations
- 99.9% calculation accuracy vs manual verification
- Zero data loss during scenario operations
- Full mobile responsiveness

### 8.2 User Experience Metrics

- Intuitive interface requiring minimal training
- Seamless integration with existing HELOC features
- Comprehensive scenario modeling capabilities
- Accessible design meeting WCAG 2.1 AA standards

### 8.3 Business Metrics

- Enhanced user engagement with budgeting features
- Increased scenario creation and saving
- Improved understanding of mortgage acceleration strategies
- Positive user feedback on new functionality

## 9. Next Steps

1. **Review and Approval**: Stakeholder review of this specification
2. **Database Design**: Finalize schema and create migration scripts
3. **API Development**: Begin implementation of core endpoints
4. **Component Development**: Start with foundational UI components
5. **Testing Strategy**: Develop comprehensive testing plan
6. **Integration Planning**: Detailed integration with existing codebase

---

_This specification serves as the foundation for implementing the dynamic mortgage acceleration budgeting tool. It will be updated as development progresses and requirements evolve._
