import { test, expect } from "@playwright/test";

async function getConsoleErrors(page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function trackFailedResponses(page) {
  const failed: { url: string; status: number }[] = [];
  page.on("response", async (res) => {
    const status = res.status();
    if (status >= 400) {
      // Allowlist some expected 404s that are handled gracefully
      const url = res.url();
      const isAllowed = /\/api\/users\/.+\/agent$/.test(url) && status === 404;
      if (!isAllowed) failed.push({ url, status });
    }
  });
  return failed;
}

test.describe("Console/Network health", () => {
  test("home and calculator are clean (Chrome only)", async ({
    page,
    browserName,
  }) => {
    const errors = await getConsoleErrors(page);
    const failed = await trackFailedResponses(page);

    // Ensure we are running in Chromium/Chrome only
    test.skip(
      browserName !== "chromium",
      "Run this smoke only in Chrome/Chromium",
    );

    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("http://localhost:3000/en/calculator");
    await page.waitForLoadState("domcontentloaded");

    // Filter out benign Next.js prefetch 404s from console errors
    const benignConsole = [
      "Failed to load resource: the server responded with a status of 404 (Not Found)",
    ];
    const filteredErrors = errors.filter(
      (e) => !benignConsole.some((b) => e.includes(b)),
    );

    // Assert: no console errors after filtering benign messages
    expect(
      filteredErrors,
      `Console errors: \n${filteredErrors.join("\n")}`,
    ).toHaveLength(0);

    // Filter out benign prefetch 404s
    const isBenignPrefetch404 = (url: string, status: number) => {
      if (status !== 404) return false;
      // Allow common Next.js prefetches to non-existent pages in this app
      return /\/handler\/forgot-password/.test(url);
    };

    const filteredFailed = failed.filter(
      (f) => !isBenignPrefetch404(f.url, f.status),
    );

    // Assert: no failed requests outside of the allowlist
    expect(
      filteredFailed,
      `Failed responses: \n${filteredFailed.map((f) => `${f.status} ${f.url}`).join("\n")}`,
    ).toHaveLength(0);
  });
});
