// Minimal debug feature gating to support console-interceptor
// Returns true only when explicitly enabled. Safe default: disabled.

export function isDebugFeatureEnabled(feature: string): boolean {
  try {
    // Allow enabling via localStorage: debug:features = comma-separated list
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("debug:features");
      if (raw) {
        const list = raw.split(",").map((s) => s.trim());
        return list.includes(feature);
      }
    }

    // Also allow enabling via env var NEXT_PUBLIC_DEBUG (comma-separated)
    const env = process.env.NEXT_PUBLIC_DEBUG;
    if (env) {
      return env
        .split(",")
        .map((s) => s.trim())
        .includes(feature);
    }
  } catch {
    // ignore
  }
  return false;
}
