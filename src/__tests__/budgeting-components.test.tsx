/**
 * Unit tests for budgeting components
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import BudgetForm from "@/components/budgeting/BudgetForm";
import BudgetSummary from "@/components/budgeting/BudgetSummary";
import BudgetDashboard from "@/components/budgeting/BudgetDashboard";

// Mock the Icon component
jest.mock("@/components/Icons", () => ({
  Icon: ({ name, size, className }: any) => (
    <div data-testid={`icon-${name}`} className={className}>
      {name}
    </div>
  ),
}));

// Mock design system components
jest.mock("@/components/design-system/Card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock("@/components/design-system/Button", () => ({
  Button: ({ children, onClick, disabled, className, type }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/design-system/Input", () => ({
  Input: ({
    label,
    value,
    onChange,
    placeholder,
    error,
    type,
    required,
  }: any) => (
    <div>
      <label>{label}</label>
      <input
        type={type || "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      />
      {error && <span data-testid="error-message">{error}</span>}
    </div>
  ),
}));

jest.mock("@/components/design-system/Select", () => ({
  Select: ({ label, value, onChange, children }: any) => (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={onChange}
        data-testid={`select-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {children}
      </select>
    </div>
  ),
}));

jest.mock("@/components/design-system/Checkbox", () => ({
  Checkbox: ({ label, checked, onChange, helperText }: any) => (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          data-testid={`checkbox-${label?.toLowerCase().replace(/\s+/g, "-")}`}
        />
        {label}
      </label>
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

jest.mock("@/components/design-system/Badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}));

describe("BudgetForm Component", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders income form correctly", () => {
    render(<BudgetForm type="income" onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Add Income Source")).toBeInTheDocument();
    expect(screen.getByTestId("input-income-source-name")).toBeInTheDocument();
    expect(screen.getByTestId("input-amount")).toBeInTheDocument();
    expect(screen.getByTestId("select-frequency")).toBeInTheDocument();
    expect(
      screen.getByTestId("checkbox-primary-income-source"),
    ).toBeInTheDocument();
  });

  it("renders expense form correctly", () => {
    render(<BudgetForm type="expense" onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Add Expense")).toBeInTheDocument();
    expect(screen.getByTestId("input-expense-name")).toBeInTheDocument();
    expect(screen.getByTestId("input-amount")).toBeInTheDocument();
    expect(screen.getByTestId("select-frequency")).toBeInTheDocument();
    expect(screen.getByTestId("select-category")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-fixed-expense")).toBeInTheDocument();
  });

  it("validates form input correctly", async () => {
    render(<BudgetForm type="income" onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", {
      name: /add income source/i,
    });

    // Try to submit empty form
    fireEvent.click(submitButton);

    // Should not call onSubmit with empty form
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits income form with correct data", async () => {
    render(<BudgetForm type="income" onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByTestId("input-income-source-name");
    const amountInput = screen.getByTestId("input-amount");
    const frequencySelect = screen.getByTestId("select-frequency");
    const primaryCheckbox = screen.getByTestId(
      "checkbox-primary-income-source",
    );
    const submitButton = screen.getByRole("button", {
      name: /add income source/i,
    });

    fireEvent.change(nameInput, { target: { value: "Test Job" } });
    fireEvent.change(amountInput, { target: { value: "5000" } });
    fireEvent.change(frequencySelect, { target: { value: "monthly" } });
    fireEvent.click(primaryCheckbox);

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Test Job",
        amount: 5000,
        frequency: "monthly",
        is_primary: true,
      });
    });
  });

  it("submits expense form with correct data", async () => {
    render(<BudgetForm type="expense" onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByTestId("input-expense-name");
    const amountInput = screen.getByTestId("input-amount");
    const frequencySelect = screen.getByTestId("select-frequency");
    const categorySelect = screen.getByTestId("select-category");
    const fixedCheckbox = screen.getByTestId("checkbox-fixed-expense");
    const submitButton = screen.getByRole("button", { name: /add expense/i });

    fireEvent.change(nameInput, { target: { value: "Rent" } });
    fireEvent.change(amountInput, { target: { value: "2000" } });
    fireEvent.change(frequencySelect, { target: { value: "monthly" } });
    fireEvent.change(categorySelect, { target: { value: "housing" } });
    fireEvent.click(fixedCheckbox); // Should be checked by default, so this unchecks it

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "Rent",
        amount: 2000,
        frequency: "monthly",
        category: "housing",
        is_fixed: false, // Unchecked
      });
    });
  });
});

describe("BudgetSummary Component", () => {
  const mockIncomeData = [
    {
      id: "1",
      name: "Primary Job",
      amount: 5000,
      frequency: "monthly" as const,
      is_primary: true,
    },
    {
      id: "2",
      name: "Side Business",
      amount: 500,
      frequency: "weekly" as const,
      is_primary: false,
    },
  ];

  const mockExpenseData = [
    {
      id: "1",
      name: "Rent",
      amount: 2000,
      frequency: "monthly" as const,
      category: "housing" as const,
      is_fixed: true,
    },
    {
      id: "2",
      name: "Groceries",
      amount: 150,
      frequency: "weekly" as const,
      category: "food" as const,
      is_fixed: false,
    },
  ];

  it("renders summary cards correctly", () => {
    render(
      <BudgetSummary
        incomeSourcesData={mockIncomeData}
        expenseCategoriesData={mockExpenseData}
      />,
    );

    expect(screen.getByText("Monthly Income")).toBeInTheDocument();
    expect(screen.getByText("Monthly Expenses")).toBeInTheDocument();
    expect(screen.getByText("Discretionary")).toBeInTheDocument();
    expect(screen.getByText("Savings Rate")).toBeInTheDocument();
  });

  it("calculates monthly amounts correctly", () => {
    render(
      <BudgetSummary
        incomeSourcesData={mockIncomeData}
        expenseCategoriesData={mockExpenseData}
      />,
    );

    // Primary Job: $5000/month + Side Business: $500/week * 4.33 = $7165/month
    // Rent: $2000/month + Groceries: $150/week * 4.33 = $2649.50/month
    // Discretionary: $7165 - $2649.50 = $4515.50/month

    expect(screen.getByText("$7,165")).toBeInTheDocument(); // Total income
    expect(screen.getByText("$2,650")).toBeInTheDocument(); // Total expenses (rounded)
    expect(screen.getByText("$4,515")).toBeInTheDocument(); // Discretionary income
  });

  it("displays income sources correctly", () => {
    render(
      <BudgetSummary
        incomeSourcesData={mockIncomeData}
        expenseCategoriesData={mockExpenseData}
      />,
    );

    expect(screen.getByText("Primary Job")).toBeInTheDocument();
    expect(screen.getByText("Side Business")).toBeInTheDocument();
    expect(screen.getByText("Primary")).toBeInTheDocument(); // Badge for primary income
  });

  it("displays expense categories correctly", () => {
    render(
      <BudgetSummary
        incomeSourcesData={mockIncomeData}
        expenseCategoriesData={mockExpenseData}
      />,
    );

    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<BudgetSummary incomeSourcesData={[]} expenseCategoriesData={[]} />);

    expect(screen.getByText("No income sources added")).toBeInTheDocument();
    expect(screen.getByText("No expenses added")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument(); // Should show $0 for all amounts
  });
});

describe("BudgetDashboard Component", () => {
  const mockScenario = {
    id: "scenario-1",
    name: "Test Scenario",
    description: "Test scenario for dashboard",
    income_sources: [
      {
        id: "1",
        name: "Primary Job",
        amount: 6000,
        frequency: "monthly",
        is_primary: true,
      },
    ],
    expense_categories: [
      {
        id: "1",
        name: "Rent",
        amount: 2000,
        frequency: "monthly",
        category: "housing",
        is_fixed: true,
      },
    ],
    discretionary_income: 4000,
    heloc_payment_percentage: 50,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnScenarioUpdate = jest.fn();

  beforeEach(() => {
    mockOnScenarioUpdate.mockClear();
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  it("renders financial health score", () => {
    render(
      <BudgetDashboard
        scenario={mockScenario}
        onScenarioUpdate={mockOnScenarioUpdate}
      />,
    );

    expect(screen.getByText("Financial Health Score")).toBeInTheDocument();
    expect(screen.getByText(/\/100/)).toBeInTheDocument();
  });

  it("renders HELOC strategy section", () => {
    render(
      <BudgetDashboard
        scenario={mockScenario}
        onScenarioUpdate={mockOnScenarioUpdate}
      />,
    );

    expect(screen.getByText("HELOC Acceleration Strategy")).toBeInTheDocument();
    expect(screen.getByText("Discretionary Income")).toBeInTheDocument();
    expect(screen.getByText("Available for HELOC")).toBeInTheDocument();
    expect(screen.getByText("Suggested Payment")).toBeInTheDocument();
  });

  it("calculates available HELOC payment correctly", () => {
    render(
      <BudgetDashboard
        scenario={mockScenario}
        onScenarioUpdate={mockOnScenarioUpdate}
      />,
    );

    // Discretionary income: $6000 - $2000 = $4000
    // Available for HELOC: $4000 - $500 (buffer) = $3500
    // Suggested payment (50%): $3500 * 0.5 = $1750

    expect(screen.getByText("$4,000")).toBeInTheDocument(); // Discretionary income
    expect(screen.getByText("$3,500")).toBeInTheDocument(); // Available for HELOC
    expect(screen.getByText("$1,750")).toBeInTheDocument(); // Suggested payment
  });

  it("handles insufficient discretionary income", () => {
    const negativeScenario = {
      ...mockScenario,
      income_sources: [
        {
          id: "1",
          name: "Low Income Job",
          amount: 1500,
          frequency: "monthly",
          is_primary: true,
        },
      ],
    };

    render(
      <BudgetDashboard
        scenario={negativeScenario}
        onScenarioUpdate={mockOnScenarioUpdate}
      />,
    );

    expect(
      screen.getByText("Insufficient Discretionary Income"),
    ).toBeInTheDocument();
  });
});
