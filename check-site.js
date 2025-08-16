const { chromium } = require("playwright");

async function checkSite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🔍 Checking https://heloc.noteware.dev...");

    // Navigate to the site with a longer timeout
    const response = await page.goto("https://heloc.noteware.dev", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log(`📊 Response Status: ${response.status()}`);
    console.log(`🌐 Final URL: ${page.url()}`);

    // Wait a bit more for dynamic content
    await page.waitForTimeout(3000);

    // Check page title
    const title = await page.title();
    console.log(`📝 Page Title: "${title}"`);

    // Check if main heading exists
    const mainHeading = await page.textContent("h1").catch(() => "Not found");
    console.log(`🏷️  Main Heading: "${mainHeading}"`);

    // Check page content length
    const bodyContent = await page.textContent("body").catch(() => "");
    console.log(`📄 Body Content Length: ${bodyContent.length} characters`);

    // Check for specific HELOC content
    const helocText = await page.textContent("text=HELOC").catch(() => null);
    console.log(`🏠 HELOC Text Found: ${helocText ? "Yes" : "No"}`);

    // Check for any error messages
    const errorElements = await page.$$("text=error");
    console.log(`❌ Error Elements: ${errorElements.length}`);

    // Take a screenshot
    await page.screenshot({ path: "site-check.png", fullPage: true });
    console.log("📸 Screenshot saved as site-check.png");

    // Check network errors
    const failedRequests = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} - ${response.url()}`);
      }
    });

    // Wait a bit more to catch any late-loading resources
    await page.waitForTimeout(2000);

    if (failedRequests.length > 0) {
      console.log("🚫 Failed Requests:");
      failedRequests.forEach((req) => console.log(`   ${req}`));
    } else {
      console.log("✅ No failed requests detected");
    }

    // Check console errors
    const logs = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        logs.push(msg.text());
      }
    });

    if (logs.length > 0) {
      console.log("🔴 Console Errors:");
      logs.forEach((log) => console.log(`   ${log}`));
    } else {
      console.log("✅ No console errors detected");
    }
  } catch (error) {
    console.error("❌ Error checking site:", error.message);

    // Try to get more details
    try {
      const content = await page.content();
      console.log("📄 Page HTML Length:", content.length);
      if (content.length < 500) {
        console.log("📄 Page Content:", content);
      }
    } catch (e) {
      console.log("Could not retrieve page content");
    }
  } finally {
    await browser.close();
  }
}

checkSite();
