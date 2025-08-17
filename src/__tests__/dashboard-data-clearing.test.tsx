/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  signOut: jest.fn(),
}));

// Mock demo storage functions
jest.mock("@/lib/demo-storage", () => ({
  getDemoScenarios: jest.fn(),
  clearDemoScenarios: jest.fn(),
  generateSampleScenarios: jest.fn(),
  getStorageInfo: jest.fn(),
  deleteDemoScenario: jest.fn(),
  updateDemoScenario: jest.fn(),
}));

// Get the mocked functions after the mock is set up
const mockGetDemoScenarios = jest.mocked(
  require("@/lib/demo-storage").getDemoScenarios,
);
const mockClearDemoScenarios = jest.mocked(
  require("@/lib/demo-storage").clearDemoScenarios,
);
const mockGenerateSampleScenarios = jest.mocked(
  require("@/lib/demo-storage").generateSampleScenarios,
);
const mockGetStorageInfo = jest.mocked(
  require("@/lib/demo-storage").getStorageInfo,
);

// Mock confirmation modals
jest.mock("@/components/ConfirmationModals", () => ({
  FirstConfirmationModal: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
  }: any) =>
    isOpen ? (
      <div data-testid="first-confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} data-testid="cancel-button">
          Cancel
        </button>
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
      </div>
    ) : null,
  SecondConfirmationModal: ({ isOpen, onClose, onConfirm, loading }: any) =>
    isOpen ? (
      <div data-testid="second-confirmation-modal">
        <button onClick={onClose} data-testid="cancel-button">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          data-testid="confirm-button"
        >
          {loading ? "Loading..." : "Confirm"}
        </button>
      </div>
    ) : null,
  SuccessModal: ({
    isOpen,
    onClose,
    onRegenerateData,
    showRegenerateOption,
  }: any) =>
    isOpen ? (
      <div data-testid="success-modal">
        {showRegenerateOption && (
          <button onClick={onRegenerateData} data-testid="regenerate-button">
            Regenerate
          </button>
        )}
        <button onClick={onClose} data-testid="close-button">
          Close
        </button>
      </div>
    ) : null,
}));

// Mock design system components
jest.mock("@/components/design-system/Modal", () => ({
  Modal: ({ children, isOpen }: any) => (isOpen ? <div>{children}</div> : null),
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/design-system/Button", () => ({
  Button: ({ children, onClick, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled || loading}>
      {loading ? "Loading..." : children}
    </button>
  ),
}));

// Set demo mode environment variable
process.env.NEXT_PUBLIC_DEMO_MODE = "true";

// Import Dashboard component after mocks
import Dashboard from "@/app/[locale]/dashboard/page";

describe("Dashboard Data Clearing Integration", () => {
  const mockScenarios = [
    {
      id: "test-1",
      name: "Test Scenario 1",
      description: "Test description",
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z",
      traditional_payoff_months: 240,
      heloc_payoff_months: 180,
      interest_saved: 50000,
    },
    {
      id: "test-2",
      name: "Test Scenario 2",
      description: "Test description 2",
      created_at: "2024-01-02T00:00:00.000Z",
      updated_at: "2024-01-02T00:00:00.000Z",
      traditional_payoff_months: 300,
      heloc_payoff_months: 200,
      interest_saved: 75000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDemoScenarios.mockReturnValue(mockScenarios);
    mockGetStorageInfo.mockReturnValue({
      used: 1024,
      available: true,
    });
  });

  it("should render demo data management section in demo mode", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Demo Data Management")).toBeInTheDocument();
    });

    expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    expect(screen.getByText("Stored Scenarios:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Number of scenarios
  });

  it("should show storage warning when localStorage is not available", async () => {
    mockGetStorageInfo.mockReturnValue({
      used: 0,
      available: false,
      error: "localStorage is not available in this browser",
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Storage Not Available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("localStorage is not available in this browser"),
    ).toBeInTheDocument();
  });

  it("should disable clear button when no scenarios exist", async () => {
    mockGetDemoScenarios.mockReturnValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      const clearButton = screen.getByText("Clear All Demo Data");
      expect(clearButton).toBeDisabled();
    });
  });

  it("should handle complete data clearing flow", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    });

    // Click clear all data button
    const clearButton = screen.getByText("Clear All Demo Data");
    await user.click(clearButton);

    // First confirmation modal should appear
    expect(screen.getByTestId("first-confirmation-modal")).toBeInTheDocument();

    // Click confirm on first modal
    const firstConfirmButton = screen.getByTestId("confirm-button");
    await user.click(firstConfirmButton);

    // Second confirmation modal should appear
    expect(screen.getByTestId("second-confirmation-modal")).toBeInTheDocument();

    // Click confirm on second modal
    const secondConfirmButton = screen.getByTestId("confirm-button");
    await user.click(secondConfirmButton);

    // Verify clearDemoScenarios was called
    expect(mockClearDemoScenarios).toHaveBeenCalledTimes(1);

    // Success modal should appear
    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });
  });

  it("should handle cancellation at first confirmation", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    });

    // Click clear all data button
    const clearButton = screen.getByText("Clear All Demo Data");
    await user.click(clearButton);

    // First confirmation modal should appear
    expect(screen.getByTestId("first-confirmation-modal")).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByTestId("cancel-button");
    await user.click(cancelButton);

    // Modal should close and no clearing should happen
    expect(
      screen.queryByTestId("first-confirmation-modal"),
    ).not.toBeInTheDocument();
    expect(mockClearDemoScenarios).not.toHaveBeenCalled();
  });

  it("should handle cancellation at second confirmation", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    });

    // Go through first confirmation
    const clearButton = screen.getByText("Clear All Demo Data");
    await user.click(clearButton);

    const firstConfirmButton = screen.getByTestId("confirm-button");
    await user.click(firstConfirmButton);

    // Second confirmation modal should appear
    expect(screen.getByTestId("second-confirmation-modal")).toBeInTheDocument();

    // Click cancel on second modal
    const cancelButton = screen.getByTestId("cancel-button");
    await user.click(cancelButton);

    // Modal should close and no clearing should happen
    expect(
      screen.queryByTestId("second-confirmation-modal"),
    ).not.toBeInTheDocument();
    expect(mockClearDemoScenarios).not.toHaveBeenCalled();
  });

  it("should handle regenerate sample data after clearing", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    });

    // Complete the clearing flow
    const clearButton = screen.getByText("Clear All Demo Data");
    await user.click(clearButton);

    const firstConfirmButton = screen.getByTestId("confirm-button");
    await user.click(firstConfirmButton);

    const secondConfirmButton = screen.getByTestId("confirm-button");
    await user.click(secondConfirmButton);

    // Success modal should appear
    await waitFor(() => {
      expect(screen.getByTestId("success-modal")).toBeInTheDocument();
    });

    // Click regenerate button
    const regenerateButton = screen.getByTestId("regenerate-button");
    await user.click(regenerateButton);

    // Verify generateSampleScenarios was called
    expect(mockGenerateSampleScenarios).toHaveBeenCalledTimes(2); // Once on load, once on regenerate
  });

  it("should handle errors during data clearing", async () => {
    const user = userEvent.setup();
    mockClearDemoScenarios.mockImplementation(() => {
      throw new Error("Storage error");
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Clear All Demo Data")).toBeInTheDocument();
    });

    // Complete the clearing flow
    const clearButton = screen.getByText("Clear All Demo Data");
    await user.click(clearButton);

    const firstConfirmButton = screen.getByTestId("confirm-button");
    await user.click(firstConfirmButton);

    const secondConfirmButton = screen.getByTestId("confirm-button");
    await user.click(secondConfirmButton);

    // Error should be handled gracefully
    expect(mockClearDemoScenarios).toHaveBeenCalledTimes(1);

    // Success modal should not appear
    expect(screen.queryByTestId("success-modal")).not.toBeInTheDocument();
  });

  it("should show storage usage with warning colors", async () => {
    // Test large storage usage
    mockGetStorageInfo.mockReturnValue({
      used: 2 * 1024 * 1024, // 2MB
      available: true,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Demo Data Management")).toBeInTheDocument();
    });

    // Should show storage usage in KB
    expect(screen.getByText("2048 KB")).toBeInTheDocument();
  });
});
