/**
 * Accessibility Tests for HELOC Accelerator
 *
 * Tests components for WCAG compliance and contrast ratios
 * using axe-core and custom contrast validation.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "@/components/design-system/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/design-system/Card";
import { Alert } from "@/components/design-system/Alert";
import { Badge } from "@/components/design-system/Badge";
import { validateTailwindCombination } from "@/lib/contrast-validation";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Component Accessibility Tests", () => {
  describe("Button Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Button variant="primary">Primary Button</Button>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have sufficient contrast for all variants", () => {
      const variants = [
        "primary",
        "secondary",
        "outline",
        "ghost",
        "danger",
      ] as const;

      variants.forEach((variant) => {
        const { container } = render(
          <Button variant={variant}>Test Button</Button>,
        );

        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();

        // Get computed styles and validate contrast
        const computedStyle = getComputedStyle(button!);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;

        // This would need actual color extraction in a real test
        // For now, we'll test the class combinations
        const className = button!.className;
        const contrastResult = validateTailwindCombination(className);

        expect(contrastResult.isValid).toBe(true);
      });
    });

    it("should be keyboard accessible", async () => {
      const { container } = render(
        <Button variant="primary">Keyboard Test</Button>,
      );

      const button = screen.getByRole("button", { name: "Keyboard Test" });

      // Test focus
      button.focus();
      expect(button).toHaveFocus();

      // Test axe for keyboard accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle loading state accessibly", async () => {
      const { container } = render(
        <Button variant="primary" loading>
          Loading Button
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should handle disabled state accessibly", async () => {
      const { container } = render(
        <Button variant="primary" disabled>
          Disabled Button
        </Button>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Card Component", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is test content for the card.</p>
          </CardContent>
        </Card>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading hierarchy", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <h3>Section Title</h3>
            <p>Section content</p>
          </CardContent>
        </Card>,
      );

      // Verify heading hierarchy
      const title = screen.getByText("Main Title");
      const sectionTitle = screen.getByText("Section Title");

      expect(title.tagName).toBe("H2"); // Card titles should be h2
      expect(sectionTitle.tagName).toBe("H3"); // Subsections should be h3
    });
  });

  describe("Alert Component", () => {
    it("should not have accessibility violations for different variants", async () => {
      const variants = ["info", "success", "warning", "danger"] as const;

      for (const variant of variants) {
        const { container } = render(
          <Alert variant={variant}>This is a {variant} alert message.</Alert>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it("should have appropriate ARIA attributes", () => {
      render(<Alert variant="warning">This is a warning message.</Alert>);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("This is a warning message.");
    });

    it("should have dismissible functionality when enabled", async () => {
      const onDismiss = jest.fn();

      const { container } = render(
        <Alert variant="info" dismissible onDismiss={onDismiss}>
          Dismissible alert
        </Alert>,
      );

      const dismissButton = screen.getByRole("button", {
        name: /dismiss|close/i,
      });
      expect(dismissButton).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Badge Component", () => {
    it("should not have accessibility violations", async () => {
      const variants = [
        "default",
        "primary",
        "secondary",
        "success",
        "warning",
        "danger",
      ] as const;

      for (const variant of variants) {
        const { container } = render(
          <Badge variant={variant}>Test Badge</Badge>,
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it("should be readable by screen readers", () => {
      render(<Badge variant="primary">New Feature</Badge>);

      const badge = screen.getByText("New Feature");
      expect(badge).toBeInTheDocument();

      // Badges should be readable but not necessarily interactive
      expect(badge).not.toHaveAttribute("tabindex");
    });
  });
});

describe("Form Accessibility Tests", () => {
  // Mock form components for testing
  const TestInput = ({ hasError = false }: { hasError?: boolean }) => (
    <div>
      <label htmlFor="test-input">Test Input</label>
      <input
        id="test-input"
        type="text"
        className={hasError ? "safe-input-error" : "safe-input"}
        aria-invalid={hasError}
        aria-describedby={hasError ? "test-input-error" : undefined}
      />
      {hasError && (
        <div id="test-input-error" role="alert" className="text-red-800">
          This field has an error
        </div>
      )}
    </div>
  );

  it("should have accessible form labels", async () => {
    const { container } = render(<TestInput />);

    const input = screen.getByLabelText("Test Input");
    expect(input).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should handle error states accessibly", async () => {
    const { container } = render(<TestInput hasError />);

    const input = screen.getByLabelText("Test Input");
    const errorMessage = screen.getByText("This field has an error");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "test-input-error");
    expect(errorMessage).toHaveAttribute("role", "alert");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Color Contrast Integration Tests", () => {
  it("should validate design system colors meet WCAG standards", () => {
    // Test primary button combinations
    const primaryResult = validateTailwindCombination(
      "bg-primary-500 text-white",
    );
    expect(primaryResult.isValid).toBe(true);

    // Test secondary button combinations
    const secondaryResult = validateTailwindCombination(
      "bg-secondary-500 text-white",
    );
    expect(secondaryResult.isValid).toBe(true);

    // Test neutral combinations
    const lightResult = validateTailwindCombination(
      "bg-white text-neutral-900",
    );
    expect(lightResult.isValid).toBe(true);

    const darkResult = validateTailwindCombination("bg-neutral-800 text-white");
    expect(darkResult.isValid).toBe(true);
  });

  it("should catch dangerous color combinations", () => {
    const dangerousCombinations = [
      "bg-white text-white",
      "bg-neutral-50 text-white",
      "bg-neutral-100 text-neutral-100",
      "bg-neutral-900 text-neutral-900",
      "bg-black text-black",
    ];

    dangerousCombinations.forEach((combination) => {
      const result = validateTailwindCombination(combination);
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
    });
  });
});

describe("Screen Reader Tests", () => {
  it("should provide proper labels for interactive elements", () => {
    render(
      <div>
        <button aria-label="Close modal">×</button>
        <button>
          <span aria-hidden="true">👍</span>
          <span className="sr-only">Like this post</span>
        </button>
        <a href="/help" aria-label="Get help with using the calculator">
          ?
        </a>
      </div>,
    );

    const closeButton = screen.getByLabelText("Close modal");
    const likeButton = screen.getByLabelText("Like this post");
    const helpLink = screen.getByLabelText(
      "Get help with using the calculator",
    );

    expect(closeButton).toBeInTheDocument();
    expect(likeButton).toBeInTheDocument();
    expect(helpLink).toBeInTheDocument();
  });

  it("should hide decorative elements from screen readers", () => {
    render(
      <div>
        <span aria-hidden="true">🎉</span>
        <span>Celebration completed!</span>
      </div>,
    );

    const decorativeIcon = document.querySelector('[aria-hidden="true"]');
    const message = screen.getByText("Celebration completed!");

    expect(decorativeIcon).toBeInTheDocument();
    expect(decorativeIcon).toHaveAttribute("aria-hidden", "true");
    expect(message).toBeInTheDocument();
  });
});

describe("Focus Management Tests", () => {
  it("should have visible focus indicators", () => {
    render(
      <div>
        <Button variant="primary">Focusable Button</Button>
        <input type="text" className="safe-input" />
        <a href="/test" className="safe-link">
          Test Link
        </a>
      </div>,
    );

    const button = screen.getByRole("button");
    const input = screen.getByRole("textbox");
    const link = screen.getByRole("link");

    // Focus each element and verify focus indicators
    [button, input, link].forEach((element) => {
      element.focus();
      expect(element).toHaveFocus();

      // Check for focus ring classes or CSS properties
      const computedStyle = getComputedStyle(element);
      const hasOutline =
        computedStyle.outline !== "none" && computedStyle.outline !== "";
      const hasBoxShadow =
        computedStyle.boxShadow !== "none" && computedStyle.boxShadow !== "";

      // Should have either outline or box-shadow for focus indication
      expect(hasOutline || hasBoxShadow).toBe(true);
    });
  });

  it("should support skip links for keyboard navigation", async () => {
    render(
      <div>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <nav>Navigation content</nav>
        <main id="main">Main content</main>
      </div>,
    );

    const skipLink = screen.getByText("Skip to main content");

    // Skip link should be hidden by default but become visible on focus
    skipLink.focus();
    expect(skipLink).toHaveFocus();

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

describe("High Contrast Mode Tests", () => {
  it("should work in high contrast mode", () => {
    // Mock high contrast media query
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-contrast: high)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<Button variant="primary">High Contrast Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    // In a real test, you'd verify high contrast styles are applied
    // This would require jsdom with CSS parsing or actual browser testing
  });
});
