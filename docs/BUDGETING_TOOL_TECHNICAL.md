# HELOC Accelerator Budgeting Tool - Technical Documentation

## Architecture Overview

The budgeting tool is built as an integrated feature of the HELOC Accelerator application, providing comprehensive financial planning capabilities with real-time calculations and HELOC integration.

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript, React 18
- **Backend**: Next.js API routes with PostgreSQL
- **Database**: PostgreSQL with Neon cloud hosting
- **Authentication**: Stack Auth for user management
- **Styling**: Tailwind CSS with custom design system
- **Testing**: Jest, React Testing Library, Playwright

## Database Schema

### Core Tables

#### budgeting_scenarios
```sql
CREATE TABLE budgeting_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discretionary_income DECIMAL(10,2) DEFAULT 0,
    heloc_payment_percentage INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### income_sources
```sql
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES budgeting_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'annual')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### expense_categories
```sql
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES budgeting_scenarios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly', 'annual')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('housing', 'transportation', 'food', 'utilities', 'insurance', 'debt', 'entertainment', 'other')),
    is_fixed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Constraints

```sql
-- Performance indexes
CREATE INDEX idx_budgeting_scenarios_user_id ON budgeting_scenarios(user_id);
CREATE INDEX idx_income_sources_scenario_id ON income_sources(scenario_id);
CREATE INDEX idx_expense_categories_scenario_id ON expense_categories(scenario_id);
CREATE INDEX idx_expense_categories_category ON expense_categories(category);

-- Data integrity constraints
ALTER TABLE budgeting_scenarios ADD CONSTRAINT check_heloc_percentage 
    CHECK (heloc_payment_percentage >= 0 AND heloc_payment_percentage <= 100);
ALTER TABLE income_sources ADD CONSTRAINT check_positive_amount 
    CHECK (amount > 0);
ALTER TABLE expense_categories ADD CONSTRAINT check_positive_amount 
    CHECK (amount > 0);
```

## API Endpoints

### Scenario Management

#### GET /api/budgeting/scenarios
Retrieve all budgeting scenarios for the authenticated user.

**Response:**
```json
{
  "scenarios": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "income_sources": [...],
      "expense_categories": [...],
      "discretionary_income": "number",
      "heloc_payment_percentage": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/budgeting/scenarios
Create a new budgeting scenario.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "heloc_payment_percentage": "number"
}
```

#### PATCH /api/budgeting/scenarios/[id]
Update an existing scenario.

#### DELETE /api/budgeting/scenarios/[id]
Delete a scenario and all associated data.

### Income Management

#### POST /api/budgeting/scenarios/[id]/income-scenarios
Add income source to a scenario.

**Request Body:**
```json
{
  "name": "string",
  "amount": "number",
  "frequency": "weekly|bi-weekly|monthly|annual",
  "is_primary": "boolean"
}
```

#### PATCH /api/budgeting/scenarios/[scenarioId]/income-scenarios/[id]
Update an income source.

#### DELETE /api/budgeting/scenarios/[scenarioId]/income-scenarios/[id]
Delete an income source.

### Expense Management

#### POST /api/budgeting/scenarios/[id]/expense-scenarios
Add expense category to a scenario.

**Request Body:**
```json
{
  "name": "string",
  "amount": "number",
  "frequency": "weekly|bi-weekly|monthly|annual",
  "category": "housing|transportation|food|utilities|insurance|debt|entertainment|other",
  "is_fixed": "boolean"
}
```

### Live Calculations

#### POST /api/budgeting/calculate-live
Perform real-time HELOC calculation with budgeting data.

**Request Body:**
```json
{
  "scenario_id": "uuid",
  "monthly_heloc_payment": "number",
  "home_value": "number",
  "loan_amount": "number",
  "interest_rate": "number",
  "loan_term_years": "number",
  "heloc_limit": "number",
  "heloc_interest_rate": "number"
}
```

## Frontend Components

### Component Architecture

```
src/app/[locale]/budgeting/
├── page.tsx                 # Main budgeting page
└── components/
    ├── BudgetForm.tsx       # Income/expense form component
    ├── BudgetSummary.tsx    # Financial summary display
    └── BudgetDashboard.tsx  # Analysis and HELOC integration
```

### Key Components

#### BudgetForm
Reusable form component for adding income sources and expenses.

**Props:**
```typescript
interface BudgetFormProps {
  type: "income" | "expense";
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}
```

#### BudgetSummary
Displays comprehensive financial overview with calculations.

**Props:**
```typescript
interface BudgetSummaryProps {
  incomeSourcesData: IncomeSource[];
  expenseCategoriesData: ExpenseCategory[];
  className?: string;
}
```

#### BudgetDashboard
Advanced dashboard with financial health scoring and HELOC integration.

**Props:**
```typescript
interface BudgetDashboardProps {
  scenario: BudgetingScenario;
  onScenarioUpdate: (scenario: BudgetingScenario) => void;
}
```

### State Management

The budgeting tool uses React state management with the following patterns:

- **Local State**: Component-level state for forms and UI interactions
- **Prop Drilling**: Data passed down through component hierarchy
- **API Integration**: Real-time data fetching and updates

### Calculation Logic

#### Frequency Conversion
```typescript
const calculateMonthlyAmount = (amount: number, frequency: string) => {
  switch (frequency) {
    case "weekly": return amount * 4.33;
    case "bi-weekly": return amount * 2.17;
    case "annual": return amount / 12;
    default: return amount; // monthly
  }
};
```

#### Financial Health Score
```typescript
const calculateHealthScore = (scenario: BudgetingScenario) => {
  let score = 0;
  
  // Income stability (20 points)
  const primaryIncomeCount = scenario.income_sources.filter(i => i.is_primary).length;
  if (primaryIncomeCount >= 1) score += 20;
  
  // Savings rate (30 points)
  const savingsRate = (discretionaryIncome / totalIncome) * 100;
  if (savingsRate >= 20) score += 30;
  else if (savingsRate >= 10) score += 20;
  else if (savingsRate >= 5) score += 10;
  
  // Emergency fund potential (25 points)
  const emergencyFundMonths = (discretionaryIncome * 12) / totalExpenses;
  if (emergencyFundMonths >= 6) score += 25;
  else if (emergencyFundMonths >= 3) score += 15;
  else if (emergencyFundMonths >= 1) score += 10;
  
  // Expense management (25 points)
  const fixedExpenseRatio = (fixedExpenses / totalExpenses) * 100;
  if (fixedExpenseRatio <= 50) score += 25;
  else if (fixedExpenseRatio <= 70) score += 15;
  else if (fixedExpenseRatio <= 80) score += 10;
  
  return Math.min(score, 100);
};
```

## Testing Strategy

### Unit Tests
- Component rendering and interaction
- Calculation logic validation
- Form validation and submission
- Error handling scenarios

### Integration Tests
- API endpoint functionality
- Database operations
- Authentication flow
- Cross-component communication

### End-to-End Tests
- Complete user workflows
- Multi-scenario management
- HELOC integration
- Accessibility compliance

### Test Files
```
src/__tests__/
├── budgeting-components.test.tsx    # Component unit tests
├── budgeting-integration.test.ts    # API integration tests
└── budgeting-e2e.test.ts           # End-to-end workflow tests
```

## Performance Considerations

### Database Optimization
- Proper indexing on foreign keys and query columns
- Efficient JOIN operations for scenario data
- Connection pooling for concurrent users

### Frontend Optimization
- Component memoization for expensive calculations
- Debounced input handling for real-time updates
- Lazy loading for large datasets

### Caching Strategy
- API response caching for static data
- Client-side state persistence
- Optimistic updates for better UX

## Security Measures

### Authentication
- Stack Auth integration for user verification
- JWT token validation on all API routes
- Session management and timeout handling

### Data Protection
- Parameterized queries to prevent SQL injection
- Input validation and sanitization
- HTTPS enforcement for all communications

### Authorization
- User-specific data isolation
- Role-based access control (if applicable)
- Audit logging for sensitive operations

## Deployment and Monitoring

### Environment Configuration
```bash
# Required environment variables
DATABASE_URL=postgresql://...
STACK_PROJECT_ID=...
STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...
```

### Monitoring
- API response time tracking
- Database query performance
- Error rate monitoring
- User engagement metrics

### Maintenance
- Regular database backups
- Performance optimization reviews
- Security updates and patches
- User feedback integration

## Future Enhancements

### Planned Features
- Budget goal setting and tracking
- Expense categorization automation
- Integration with bank APIs
- Advanced reporting and analytics
- Mobile app development

### Scalability Considerations
- Database sharding for large user bases
- CDN integration for global performance
- Microservices architecture migration
- Real-time collaboration features

## Development Guidelines

### Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Component documentation with JSDoc
- Comprehensive error handling

### Git Workflow
- Feature branch development
- Pull request reviews
- Automated testing on CI/CD
- Semantic versioning for releases

### Documentation
- API documentation with OpenAPI
- Component storybook for UI library
- Database schema documentation
- Deployment runbooks

## Quick Start for Developers

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

### Testing
```bash
npm test                    # Run unit tests
npm run test:integration   # Run integration tests
npm run test:e2e          # Run end-to-end tests
```

### Building
```bash
npm run build             # Production build
npm run start             # Start production server
```
