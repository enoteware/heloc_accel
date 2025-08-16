import {
  calculateLTV,
  isMIPRequired,
  calculateStandardMIPRate,
  safeLTVCalculation,
  calculateSuggestedMonthlyPMI,
} from "../calculations";
import { CalculationError } from "../errors";

describe("LTV Calculation Functions", () => {
  describe("calculateLTV", () => {
    it("should calculate LTV correctly for valid inputs", () => {
      expect(calculateLTV(400000, 500000)).toBe(80);
      expect(calculateLTV(450000, 500000)).toBe(90);
      expect(calculateLTV(350000, 500000)).toBe(70);
    });

    it("should throw CalculationError for null/undefined inputs", () => {
      expect(() => calculateLTV(null as any, 500000)).toThrow(CalculationError);
      expect(() => calculateLTV(400000, undefined as any)).toThrow(
        CalculationError,
      );
    });

    it("should throw CalculationError for invalid number inputs", () => {
      expect(() => calculateLTV("invalid" as any, 500000)).toThrow(
        CalculationError,
      );
      expect(() => calculateLTV(400000, "invalid" as any)).toThrow(
        CalculationError,
      );
    });

    it("should throw CalculationError for negative or zero values", () => {
      expect(() => calculateLTV(-100000, 500000)).toThrow(CalculationError);
      expect(() => calculateLTV(400000, 0)).toThrow(CalculationError);
    });
  });

  describe("isMIPRequired", () => {
    it("should return true when LTV > 80%", () => {
      expect(isMIPRequired(85)).toBe(true);
      expect(isMIPRequired(90)).toBe(true);
      expect(isMIPRequired(95)).toBe(true);
    });

    it("should return false when LTV <= 80%", () => {
      expect(isMIPRequired(80)).toBe(false);
      expect(isMIPRequired(75)).toBe(false);
      expect(isMIPRequired(70)).toBe(false);
    });
  });

  describe("calculateStandardMIPRate", () => {
    it("should return 0 for LTV <= 80%", () => {
      expect(calculateStandardMIPRate(80)).toBe(0);
      expect(calculateStandardMIPRate(75)).toBe(0);
    });

    it("should return correct rates for different LTV ranges", () => {
      expect(calculateStandardMIPRate(85)).toBe(0.005); // 0.5%
      expect(calculateStandardMIPRate(90)).toBe(0.0075); // 0.75%
      expect(calculateStandardMIPRate(95)).toBe(0.01); // 1.0%
      expect(calculateStandardMIPRate(98)).toBe(0.0125); // 1.25%
    });
  });

  describe("safeLTVCalculation", () => {
    it("should return success for valid inputs", () => {
      const result = safeLTVCalculation(400000, 500000);
      expect(result.success).toBe(true);
      expect(result.ltvRatio).toBe(80);
      expect(result.canCalculate).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error for invalid inputs without throwing", () => {
      const result = safeLTVCalculation(null, 500000);
      expect(result.success).toBe(false);
      expect(result.ltvRatio).toBe(0);
      expect(result.canCalculate).toBe(false);
      expect(result.error).toBe(
        "Both loan amount and original purchase price are required",
      );
    });

    it("should handle string inputs", () => {
      const result = safeLTVCalculation("400000", "500000");
      expect(result.success).toBe(true);
      expect(result.ltvRatio).toBe(80);
    });
  });

  describe("calculateSuggestedMonthlyPMI", () => {
    it("should return 0 when MIP not required", () => {
      expect(calculateSuggestedMonthlyPMI(400000, 75)).toBe(0);
    });

    it("should calculate correct monthly PMI for different LTV ranges", () => {
      // LTV 85% = 0.5% annual = $400,000 * 0.005 / 12 = $166.67 ≈ $167
      expect(calculateSuggestedMonthlyPMI(400000, 85)).toBe(167);

      // LTV 90% = 0.75% annual = $400,000 * 0.0075 / 12 = $250
      expect(calculateSuggestedMonthlyPMI(400000, 90)).toBe(250);

      // LTV 95% = 1.0% annual = $400,000 * 0.01 / 12 = $333.33 ≈ $333
      expect(calculateSuggestedMonthlyPMI(400000, 95)).toBe(333);
    });
  });

  describe("Edge Cases - Extreme LTV Scenarios", () => {
    it("should handle very high LTV (>100%)", () => {
      const loanAmount = 600000;
      const propertyValue = 500000;

      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBe(120); // 600k/500k = 120%

      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(true); // 120% > 80%

      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(625); // $600,000 * 0.0125 / 12 = $625
    });

    it("should handle exactly 80% LTV (boundary case)", () => {
      const loanAmount = 400000;
      const propertyValue = 500000;

      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBe(80); // 400k/500k = 80%

      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(false); // 80% = 80% (not greater than)

      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(0); // No PMI at exactly 80%
    });

    it("should handle very low LTV (<50%)", () => {
      const loanAmount = 200000;
      const propertyValue = 500000;

      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBe(40); // 200k/500k = 40%

      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(false); // 40% <= 80%

      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(0); // No PMI required
    });

    it("should handle 80.1% LTV (just over boundary)", () => {
      const loanAmount = 400500;
      const propertyValue = 500000;

      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBeCloseTo(80.1, 1); // 400.5k/500k = 80.1% (allow floating point precision)

      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(true); // 80.1% > 80%

      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(167); // $400,500 * 0.005 / 12 = $167.08 ≈ $167
    });
  });

  describe("Invalid Input Scenarios", () => {
    it("should handle negative loan amounts", () => {
      const result = safeLTVCalculation(-100000, 500000);
      expect(result.success).toBe(false);
      expect(result.canCalculate).toBe(false);
      expect(result.error).toContain("positive");
    });

    it("should handle zero property value", () => {
      const result = safeLTVCalculation(400000, 0);
      expect(result.success).toBe(false);
      expect(result.canCalculate).toBe(false);
      expect(result.error).toContain("positive");
    });

    it("should handle non-numeric strings", () => {
      const result = safeLTVCalculation("not-a-number", "also-not-a-number");
      expect(result.success).toBe(false);
      expect(result.canCalculate).toBe(false);
      expect(result.error).toContain("valid numbers");
    });

    it("should handle empty strings", () => {
      const result = safeLTVCalculation("", "");
      expect(result.success).toBe(false);
      expect(result.canCalculate).toBe(false);
      expect(result.error).toContain("positive"); // Empty strings convert to 0, which triggers the "positive values" error
    });

    it("should handle mixed valid/invalid inputs", () => {
      const result1 = safeLTVCalculation(400000, "invalid");
      expect(result1.success).toBe(false);

      const result2 = safeLTVCalculation("invalid", 500000);
      expect(result2.success).toBe(false);
    });
  });

  describe("Realistic Mortgage Scenarios", () => {
    const scenarios = [
      {
        name: "First-time buyer with 10% down",
        loanAmount: 450000,
        propertyValue: 500000,
        expectedLTV: 90,
        expectedPMI: 281,
        expectedMIPRequired: true,
      },
      {
        name: "Conventional loan with 20% down",
        loanAmount: 400000,
        propertyValue: 500000,
        expectedLTV: 80,
        expectedPMI: 0,
        expectedMIPRequired: false,
      },
      {
        name: "Jumbo loan scenario",
        loanAmount: 800000,
        propertyValue: 1000000,
        expectedLTV: 80,
        expectedPMI: 0,
        expectedMIPRequired: false,
      },
      {
        name: "High-cost area with 5% down",
        loanAmount: 950000,
        propertyValue: 1000000,
        expectedLTV: 95,
        expectedPMI: 792,
        expectedMIPRequired: true,
      },
      {
        name: "Refinance scenario with equity",
        loanAmount: 300000,
        propertyValue: 500000,
        expectedLTV: 60,
        expectedPMI: 0,
        expectedMIPRequired: false,
      },
      {
        name: "Starter home purchase",
        loanAmount: 285000,
        propertyValue: 300000,
        expectedLTV: 95,
        expectedPMI: 238,
        expectedMIPRequired: true,
      },
    ];

    scenarios.forEach((scenario) => {
      it(`should handle ${scenario.name}`, () => {
        const ltvResult = safeLTVCalculation(
          scenario.loanAmount,
          scenario.propertyValue,
        );
        expect(ltvResult.success).toBe(true);
        expect(ltvResult.ltvRatio).toBe(scenario.expectedLTV);

        const mipRequired = isMIPRequired(ltvResult.ltvRatio);
        expect(mipRequired).toBe(scenario.expectedMIPRequired);

        const suggestedPMI = calculateSuggestedMonthlyPMI(
          scenario.loanAmount,
          ltvResult.ltvRatio,
        );
        expect(suggestedPMI).toBe(scenario.expectedPMI);
      });
    });
  });

  describe("Integration Test - Real World Scenario", () => {
    it("should handle typical mortgage scenario correctly", () => {
      const loanAmount = 350000;
      const propertyValue = 500000;

      // Calculate LTV
      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBe(70); // 350k/500k = 70%

      // Check if MIP required
      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(false); // 70% <= 80%

      // Calculate suggested PMI
      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(0); // No PMI required
    });

    it("should handle high LTV scenario correctly", () => {
      const loanAmount = 450000;
      const propertyValue = 500000;

      // Calculate LTV
      const ltvResult = safeLTVCalculation(loanAmount, propertyValue);
      expect(ltvResult.success).toBe(true);
      expect(ltvResult.ltvRatio).toBe(90); // 450k/500k = 90%

      // Check if MIP required
      const mipRequired = isMIPRequired(ltvResult.ltvRatio);
      expect(mipRequired).toBe(true); // 90% > 80%

      // Calculate suggested PMI
      const suggestedPMI = calculateSuggestedMonthlyPMI(
        loanAmount,
        ltvResult.ltvRatio,
      );
      expect(suggestedPMI).toBe(281); // $450,000 * 0.0075 / 12 = $281.25 ≈ $281
    });
  });
});
