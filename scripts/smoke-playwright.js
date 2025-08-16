const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const netErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("response", (res) => {
    try {
      const url = new URL(res.url());
      const isLocal =
        (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        (url.port === "3000" || url.port === "");
      if (isLocal && res.status() >= 400) {
        netErrors.push({ status: res.status(), url: res.url() });
      }
    } catch (_) {}
  });

  const results = { steps: [], consoleErrors, pageErrors, netErrors };

  async function visit(path) {
    const url = path.startsWith("http") ? path : `http://localhost:3000${path}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    // give SPA time
    await page.waitForTimeout(800);
    results.steps.push({ url: page.url(), title: await page.title() });
  }

  try {
    await visit("/");
    await visit("/en");
    await visit("/en/calculator");
  } catch (e) {
    results.error = String(e);
  } finally {
    console.log(JSON.stringify(results, null, 2));
    await browser.close();
  }
})();
