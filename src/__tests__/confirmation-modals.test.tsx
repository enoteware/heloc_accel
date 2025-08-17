/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FirstConfirmationModal,
  SecondConfirmationModal,
  SuccessModal,
} from "@/components/ConfirmationModals";

// Mock the design system components
jest.mock("@/components/design-system/Modal", () => ({
  Modal: ({ children, isOpen, title, onClose }: any) =>
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-labelledby="modal-title">
        <h1 id="modal-title">{title}</h1>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        {children}
      </div>
    ) : null,
  ModalBody: ({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: any) => (
    <div data-testid="modal-footer">{children}</div>
  ),
}));

jest.mock("@/components/design-system/Button", () => {
  const Button = React.forwardRef<HTMLButtonElement, any>(
    ({ children, onClick, disabled, loading, variant, ...props }, ref) => (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        data-variant={variant}
        data-loading={loading}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    ),
  );
  Button.displayName = "Button";
  return { Button };
});

jest.mock("@/components/design-system/Input", () => {
  const Input = React.forwardRef<HTMLInputElement, any>(
    ({ onChange, onKeyDown, error, ...props }, ref) => (
      <div>
        <input ref={ref} onChange={onChange} onKeyDown={onKeyDown} {...props} />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    ),
  );
  Input.displayName = "Input";
  return { Input };
});

describe("FirstConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Test Confirmation",
    message: "Are you sure?",
    confirmText: "Confirm",
    cancelText: "Cancel",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render when open", () => {
    render(<FirstConfirmationModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<FirstConfirmationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(<FirstConfirmationModal {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should have proper accessibility attributes", () => {
    render(<FirstConfirmationModal {...defaultProps} />);

    const message = screen.getByText("Are you sure?");
    expect(message).toHaveAttribute("role", "alert");
    expect(message).toHaveAttribute("aria-live", "polite");
    expect(message).toHaveAttribute("id", "confirmation-message");
  });

  it("should focus cancel button on open", async () => {
    render(<FirstConfirmationModal {...defaultProps} />);

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toHaveFocus();
    });
  });
});

describe("SecondConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Final Confirmation",
    message: "Type the confirmation text:",
    confirmationText: "DELETE ALL DATA",
    placeholder: "Type here...",
    confirmText: "Confirm",
    cancelText: "Cancel",
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render when open", () => {
    render(<SecondConfirmationModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Final Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Type the confirmation text:")).toBeInTheDocument();
    expect(screen.getByText("DELETE ALL DATA")).toBeInTheDocument();
  });

  it("should disable confirm button when input is empty", () => {
    render(<SecondConfirmationModal {...defaultProps} />);

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toBeDisabled();
  });

  it("should enable confirm button when correct text is entered", async () => {
    const user = userEvent.setup();
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    await user.type(input, "DELETE ALL DATA");

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).not.toBeDisabled();
  });

  it("should disable confirm button when incorrect text is entered", async () => {
    const user = userEvent.setup();
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    await user.type(input, "wrong text");

    const confirmButton = screen.getByText("Confirm");
    expect(confirmButton).toBeDisabled();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("should call onConfirm when correct text is entered and confirm is clicked", async () => {
    const user = userEvent.setup();
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    await user.type(input, "DELETE ALL DATA");

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should handle Enter key press when text is valid", async () => {
    const user = userEvent.setup();
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    await user.type(input, "DELETE ALL DATA");
    await user.keyboard("{Enter}");

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should not submit on Enter when text is invalid", async () => {
    const user = userEvent.setup();
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    await user.type(input, "wrong text");
    await user.keyboard("{Enter}");

    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("should show loading state", () => {
    render(<SecondConfirmationModal {...defaultProps} loading={true} />);

    const confirmButton = screen.getByText("Loading...");
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveAttribute("data-loading", "true");
  });

  it("should clear input when modal closes and reopens", () => {
    const { rerender } = render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(
      "Type here...",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "some text" } });
    expect(input.value).toBe("some text");

    // Close modal
    rerender(<SecondConfirmationModal {...defaultProps} isOpen={false} />);

    // Reopen modal
    rerender(<SecondConfirmationModal {...defaultProps} isOpen={true} />);

    const newInput = screen.getByPlaceholderText(
      "Type here...",
    ) as HTMLInputElement;
    expect(newInput.value).toBe("");
  });

  it("should have proper accessibility attributes", () => {
    render(<SecondConfirmationModal {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type here...");
    expect(input).toHaveAttribute("aria-labelledby", "confirmation-label");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "confirmation-text confirmation-instructions",
    );
    expect(input).toHaveAttribute("aria-required", "true");
  });
});

describe("SuccessModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onRegenerateData: jest.fn(),
    title: "Success",
    message: "Operation completed successfully.",
    showRegenerateOption: true,
    regenerateText: "Regenerate",
    closeText: "Close",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render when open", () => {
    render(<SuccessModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(
      screen.getByText("Operation completed successfully."),
    ).toBeInTheDocument();
  });

  it("should show regenerate button when showRegenerateOption is true", () => {
    render(<SuccessModal {...defaultProps} />);

    expect(screen.getByText("Regenerate")).toBeInTheDocument();
  });

  it("should hide regenerate button when showRegenerateOption is false", () => {
    render(<SuccessModal {...defaultProps} showRegenerateOption={false} />);

    expect(screen.queryByText("Regenerate")).not.toBeInTheDocument();
  });

  it("should call onRegenerateData when regenerate button is clicked", async () => {
    const user = userEvent.setup();
    render(<SuccessModal {...defaultProps} />);

    const regenerateButton = screen.getByText("Regenerate");
    await user.click(regenerateButton);

    expect(defaultProps.onRegenerateData).toHaveBeenCalledTimes(1);
  });

  describe("Modal Integration Tests", () => {
    it("should handle complete confirmation flow", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      // First confirmation modal
      const { rerender } = render(
        <FirstConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={() => {
            onConfirm();
            // Simulate moving to second confirmation
            rerender(
              <SecondConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                confirmationText="DELETE ALL DATA"
              />,
            );
          }}
          title="Clear All Data"
          message="This will delete all your data. Continue?"
        />,
      );

      // Click confirm on first modal
      const firstConfirmButton = screen.getByText("Continue");
      await user.click(firstConfirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);

      // Now we should see the second confirmation modal
      expect(screen.getByText("Final Confirmation")).toBeInTheDocument();

      // Type the confirmation text
      const input = screen.getByPlaceholderText(
        "Type confirmation text here...",
      );
      await user.type(input, "DELETE ALL DATA");

      // Click confirm on second modal
      const secondConfirmButton = screen.getByText("Confirm Deletion");
      await user.click(secondConfirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(2);
    });

    it("should handle cancellation at any step", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <FirstConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Clear All Data"
          message="This will delete all your data. Continue?"
        />,
      );

      // Click cancel
      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should handle keyboard navigation", async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <SecondConfirmationModal
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          confirmationText="DELETE ALL DATA"
        />,
      );

      // Focus input and type
      const input = screen.getByPlaceholderText(
        "Type confirmation text here...",
      );
      await user.click(input);
      await user.type(input, "DELETE ALL DATA");

      // Press Enter to confirm
      await user.keyboard("{Enter}");

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SuccessModal {...defaultProps} />);

    const buttons = screen.getAllByRole("button", { name: "Close" });
    const primaryCloseButton = buttons.find(
      (button) => button.getAttribute("data-variant") === "primary",
    );
    await user.click(primaryCloseButton!);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("should focus close button on open", async () => {
    render(<SuccessModal {...defaultProps} />);

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: "Close" });
      const primaryCloseButton = buttons.find(
        (button) => button.getAttribute("data-variant") === "primary",
      );
      expect(primaryCloseButton).toHaveFocus();
    });
  });

  it("should have proper accessibility attributes", () => {
    render(<SuccessModal {...defaultProps} />);

    const message = screen.getByText("Operation completed successfully.");
    expect(message).toHaveAttribute("role", "status");
    expect(message).toHaveAttribute("aria-live", "polite");
    expect(message).toHaveAttribute("id", "success-message");
  });
});
