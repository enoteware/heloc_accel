// Demo data storage utilities used in tests and demo mode
// Matches behavior expected by unit tests under src/__tests__/demo-data-clearing.test.ts

export interface DemoScenario {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields allowed (mortgage/income/expense data), we don't strictly type them here
  [key: string]: any;
}

const STORAGE_KEY = "heloc-demo-scenarios";
const TEST_KEY = "__localStorage_test__";
const MAX_BYTES = 2_000_000; // 2MB limit for demo storage safety

function assertLocalStorageAvailable(): void {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    throw new Error(
      "localStorage is not available in this browser. Demo data cannot be saved.",
    );
  }
  try {
    window.localStorage.setItem(TEST_KEY, "ok");
    window.localStorage.removeItem(TEST_KEY);
  } catch (e) {
    // Treat as unavailable if cannot write/remove
    throw new Error(
      "localStorage is not available in this browser. Demo data cannot be saved.",
    );
  }
}

export function getDemoScenarios(): DemoScenario[] {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    // Filter invalid entries (require at least id and name)
    const cleaned = parsed.filter(
      (item: any) => item && typeof item === "object" && item.id && item.name,
    );
    if (cleaned.length !== parsed.length) {
      // Save cleaned data back
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } catch {
        // ignore write-back errors here
      }
    }
    return cleaned;
  } catch (e) {
    // Corrupted JSON, clear
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return [];
  }
}

export function saveDemoScenarios(scenarios: DemoScenario[]): void {
  assertLocalStorageAvailable();
  // Validate size before attempting to save
  const payload = JSON.stringify(scenarios);
  if (payload.length > MAX_BYTES) {
    throw new Error(
      "Data size too large. Please reduce the number of scenarios.",
    );
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (e: any) {
    if (e && (e.name === "QuotaExceededError" || /quota/i.test(String(e)))) {
      throw new Error(
        "Storage quota exceeded. Please clear some data or use fewer scenarios.",
      );
    }
    throw e;
  }
}

export function clearDemoScenarios(): void {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    throw new Error("localStorage is not available in this browser.");
  }
  try {
    // Basic availability check first
    window.localStorage.setItem(TEST_KEY, "ok");
    window.localStorage.removeItem(TEST_KEY);
  } catch {
    throw new Error(
      "Failed to clear demo data. Your browser may not support localStorage or storage may be full.",
    );
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new Error(
      "Failed to clear demo data. Your browser may not support localStorage or storage may be full.",
    );
  }
}

export function addDemoScenario(input: any): DemoScenario {
  const scenarios = getDemoScenarios();
  const now = new Date().toISOString();
  const scenario: DemoScenario = {
    id: input?.id || `${Date.now()}`,
    name: input?.name || "New Scenario",
    description: input?.description,
    createdAt: input?.createdAt || now,
    updatedAt: now,
    ...input,
  };
  const updated = [...scenarios, scenario];
  saveDemoScenarios(updated);
  return scenario;
}

export function deleteDemoScenario(id: string): boolean {
  const existing = getDemoScenarios();
  const filtered = existing.filter((s) => s.id !== id);
  const changed = filtered.length !== existing.length;
  saveDemoScenarios(filtered);
  return changed;
}

export function getStorageInfo(): {
  used: number;
  available: boolean;
  error?: string;
} {
  if (
    typeof window === "undefined" ||
    typeof window.localStorage === "undefined"
  ) {
    return {
      used: 0,
      available: false,
      error: "localStorage is not available in this browser",
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "";
    return { used: raw.length, available: true };
  } catch (e: any) {
    return { used: 0, available: false, error: e?.message };
  }
}

export function generateSampleScenarios(): DemoScenario[] {
  const samples: DemoScenario[] = [
    {
      id: "sample-1",
      name: "Sample Scenario 1",
      description: "Sample description",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentMortgageBalance: 250000,
      currentInterestRate: 0.065,
      remainingTermMonths: 240,
      monthlyPayment: 1800,
      monthlyGrossIncome: 8000,
      monthlyNetIncome: 6000,
      monthlyExpenses: 4500,
      monthlyDiscretionaryIncome: 1500,
    },
  ];
  saveDemoScenarios(samples);
  return samples;
}
