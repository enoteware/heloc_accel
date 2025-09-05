/**
 * Test for LTV calculation error fix
 * Ensures that empty/null inputs don't cause console errors
 */

import { safeLTVCalculation } from "../calculations";
import { debugLTVCalculation, debugLogger } from "../debug-utils";

// Mock console.error to capture any errors
const originalConsoleError = console.error;
let consoleErrors: any[] = [];

beforeEach(() => {
  consoleErrors = [];
  console.error = jest.fn((...args) => {
    consoleErrors.push(args);
  });
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe("LTV Error Fix", () => {
  it("should not log console errors for null inputs", () => {
    const result = safeLTVCalculation(null, null);

    expect(result.success).toBe(false);
    expect(result.canCalculate).toBe(false);
    expect(consoleErrors.length).toBe(0);
  });

  it("should not log console errors for undefined inputs", () => {
    const result = safeLTVCalculation(undefined, undefined);

    expect(result.success).toBe(false);
    expect(result.canCalculate).toBe(false);
    expect(consoleErrors.length).toBe(0);
  });

  it("should not log console errors for empty string inputs", () => {
    const result = safeLTVCalculation("", "");

    expect(result.success).toBe(false);
    expect(result.canCalculate).toBe(false);
    expect(consoleErrors.length).toBe(0);
  });

  it("should not log console errors for mixed null/empty inputs", () => {
    const result1 = safeLTVCalculation(null, "");
    const result2 = safeLTVCalculation("", null);

    expect(result1.success).toBe(false);
    expect(result2.success).toBe(false);
    expect(consoleErrors.length).toBe(0);
  });

  it("should work correctly with valid inputs", () => {
    const result = safeLTVCalculation(400000, 500000);

    expect(result.success).toBe(true);
    expect(result.canCalculate).toBe(true);
    expect(result.ltvRatio).toBe(80);
    expect(consoleErrors.length).toBe(0);
  });

  it("should handle debugLTVCalculation without console errors", () => {
    const debugResult = debugLTVCalculation(null, null);

    expect(debugResult.loanAmount).toBe(null);
    expect(debugResult.propertyValue).toBe(null);
    expect(debugResult.errors).toBeDefined();
    expect(consoleErrors.length).toBe(0);
  });
});
