# 💰 HELOC Accelerator Budgeting Tool

A comprehensive financial planning tool integrated with the HELOC Accelerator application, designed to help users optimize their mortgage payoff strategy through detailed income and expense analysis.

## ✨ Features

### 📊 Budget Management
- **Multiple Scenarios**: Create and compare different budget scenarios
- **Income Tracking**: Track all income sources with flexible frequency options
- **Expense Categorization**: Organize expenses by category and type
- **Real-time Calculations**: Automatic monthly conversions and totals

### 🎯 Financial Analysis
- **Financial Health Score**: 0-100 scoring based on income stability, savings rate, emergency fund, and expense management
- **Discretionary Income Calculation**: Automatic calculation of available funds
- **Savings Rate Analysis**: Percentage of income available for savings and investments
- **Emergency Fund Recommendations**: Guidance on emergency fund adequacy

### 🏠 HELOC Integration
- **Live HELOC Calculations**: Real-time mortgage acceleration analysis
- **Payment Optimization**: Adjustable HELOC payment percentage allocation
- **Interest Savings Projections**: Calculate potential interest savings and time reduction
- **Strategy Recommendations**: Personalized HELOC acceleration strategies

### 📱 User Experience
- **Intuitive Interface**: Clean, modern design with easy navigation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Instant calculations as you input data
- **Comprehensive Validation**: Form validation and error handling

## 🚀 Quick Start

### For Users

1. **Access the Tool**
   - Navigate to the Budgeting section in the main menu
   - Sign in with your account (demo mode available)

2. **Create Your First Scenario**
   - Click "New Scenario" to get started
   - Add your income sources and expenses
   - Review your financial analysis

3. **Optimize Your Strategy**
   - Use the Analysis tab to see your financial health score
   - Adjust HELOC payment percentages
   - Run live HELOC calculations

### For Developers

1. **Setup**
   ```bash
   git clone <repository>
   cd heloc-accelerator
   npm install
   npm run dev
   ```

2. **Database Setup**
   ```bash
   npm run db:setup
   npm run db:migrate
   ```

3. **Testing**
   ```bash
   npm test                    # Unit tests
   npm run test:integration   # Integration tests
   npm run test:e2e          # End-to-end tests
   ```

## 📋 How It Works

### 1. Income Management
- Add all income sources (salary, freelance, investments, etc.)
- Specify frequency (weekly, bi-weekly, monthly, annual)
- Mark primary income sources
- Automatic monthly conversion for calculations

### 2. Expense Tracking
- Categorize expenses (housing, transportation, food, etc.)
- Distinguish between fixed and variable expenses
- Track all frequencies with automatic monthly conversion
- Comprehensive expense categories for accurate tracking

### 3. Financial Analysis
The tool calculates:
- **Total Monthly Income**: All income sources converted to monthly amounts
- **Total Monthly Expenses**: All expenses converted to monthly amounts
- **Discretionary Income**: Income minus expenses
- **Savings Rate**: Percentage of income available for savings
- **Financial Health Score**: Comprehensive scoring based on multiple factors

### 4. HELOC Optimization
- Calculates available funds for HELOC payments
- Applies safety buffer (default $500)
- Allows percentage allocation adjustment
- Provides real-time HELOC acceleration analysis

## 🎯 Financial Health Scoring

The financial health score (0-100) is calculated based on:

| Component | Points | Criteria |
|-----------|--------|----------|
| **Income Stability** | 20 | Having primary income source |
| **Savings Rate** | 30 | 20%+ (30pts), 10-19% (20pts), 5-9% (10pts) |
| **Emergency Fund** | 25 | 6+ months (25pts), 3-5 months (15pts), 1-2 months (10pts) |
| **Expense Management** | 25 | Fixed expenses ≤50% (25pts), 51-70% (15pts), 71-80% (10pts) |

### Score Interpretation
- **80-100**: Excellent financial health ✅
- **60-79**: Good financial health 👍
- **40-59**: Fair financial health ⚠️
- **0-39**: Needs improvement 🔴

## 🛠️ Technical Architecture

### Frontend
- **Next.js 14** with TypeScript
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Custom Design System** components

### Backend
- **Next.js API Routes** for serverless functions
- **PostgreSQL** database with Neon hosting
- **Stack Auth** for authentication
- **RESTful API** design

### Database Schema
- `budgeting_scenarios`: User budget scenarios
- `income_sources`: Income tracking with frequency
- `expense_categories`: Expense tracking with categorization

## 📊 API Endpoints

### Scenarios
- `GET /api/budgeting/scenarios` - List user scenarios
- `POST /api/budgeting/scenarios` - Create new scenario
- `PATCH /api/budgeting/scenarios/[id]` - Update scenario
- `DELETE /api/budgeting/scenarios/[id]` - Delete scenario

### Income & Expenses
- `POST /api/budgeting/scenarios/[id]/income-scenarios` - Add income
- `POST /api/budgeting/scenarios/[id]/expense-scenarios` - Add expense
- `PATCH /api/budgeting/scenarios/[scenarioId]/income-scenarios/[id]` - Update income
- `DELETE /api/budgeting/scenarios/[scenarioId]/income-scenarios/[id]` - Delete income

### Calculations
- `POST /api/budgeting/calculate-live` - Real-time HELOC calculation

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component logic and calculations
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Accessibility Tests**: WCAG compliance

### Test Files
```
src/__tests__/
├── budgeting-components.test.tsx    # Component tests
├── budgeting-integration.test.ts    # API tests
└── budgeting-e2e.test.ts           # Workflow tests
```

## 📚 Documentation

- **[User Guide](./BUDGETING_TOOL_GUIDE.md)**: Comprehensive user documentation
- **[Technical Docs](./BUDGETING_TOOL_TECHNICAL.md)**: Developer and architecture documentation
- **API Documentation**: Detailed endpoint specifications
- **Component Documentation**: React component props and usage

## 🔒 Security & Privacy

- **Authentication**: Stack Auth integration with JWT tokens
- **Data Protection**: Parameterized queries, input validation
- **User Isolation**: User-specific data access controls
- **HTTPS**: Encrypted data transmission

## 🚀 Performance

- **Optimized Queries**: Efficient database operations with proper indexing
- **Real-time Calculations**: Client-side calculations for instant feedback
- **Responsive Design**: Fast loading on all devices
- **Caching**: Strategic caching for improved performance

## 🔮 Future Enhancements

- **Bank Integration**: Automatic transaction import
- **Goal Setting**: Budget goals and progress tracking
- **Advanced Analytics**: Detailed spending analysis and trends
- **Mobile App**: Native mobile application
- **Collaboration**: Shared budgets for couples/families

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is part of the HELOC Accelerator application. See the main project license for details.

## 📞 Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Contact the development team
- Refer to the comprehensive documentation

---

**Built with ❤️ for better financial planning and mortgage acceleration strategies.**
