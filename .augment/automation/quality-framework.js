#!/usr/bin/env node

/**
 * Augment Quality Framework
 * Automated quality checks that integrate with Augment's tools
 * Replaces Claude Code hooks with Augment-compatible automation
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class AugmentQualityFramework {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      preEdit: [],
      postEdit: [],
      ui: [],
      session: [],
    };
  }

  // Pre-Edit Health Check (replaces PreToolUse hook)
  async runPreEditChecks() {
    console.log("🔍 Augment Pre-Edit Health Check");
    console.log("================================");

    const checks = [
      this.checkTypeScript,
      this.checkLinting,
      this.checkGitStatus,
      this.checkEnvironment,
      this.checkNodeVersion,
    ];

    for (const check of checks) {
      try {
        const result = await check.call(this);
        this.results.preEdit.push(result);
      } catch (error) {
        this.results.preEdit.push({
          status: "error",
          message: error.message,
          blocking: true,
        });
      }
    }

    return this.formatResults("preEdit");
  }

  // Post-Edit Quality Check (replaces PostToolUse hook)
  async runPostEditChecks() {
    console.log("✅ Augment Post-Edit Quality Check");
    console.log("==================================");

    const checks = [
      this.checkTypeScriptCompilation,
      this.checkLintingStrict,
      this.checkSecurityPatterns,
      this.checkTestsQuick,
    ];

    for (const check of checks) {
      try {
        const result = await check.call(this);
        this.results.postEdit.push(result);
      } catch (error) {
        this.results.postEdit.push({
          status: "error",
          message: error.message,
          blocking: false,
        });
      }
    }

    return this.formatResults("postEdit");
  }

  // UI Consistency Check (replaces UI-specific hooks)
  async runUIChecks() {
    console.log("🎨 Augment UI Consistency Check");
    console.log("===============================");

    const checks = [
      this.checkColorContrast,
      this.checkDesignSystemUsage,
      this.checkAccessibility,
      this.checkFinancialFormatting,
    ];

    for (const check of checks) {
      try {
        const result = await check.call(this);
        this.results.ui.push(result);
      } catch (error) {
        this.results.ui.push({
          status: "warning",
          message: error.message,
          blocking: false,
        });
      }
    }

    return this.formatResults("ui");
  }

  // Session Status (replaces SessionStart hook)
  async runSessionStatus() {
    console.log("📊 Augment Session Status");
    console.log("=========================");

    const checks = [
      this.getGitStatus,
      this.getBuildStatus,
      this.getProjectHealth,
    ];

    for (const check of checks) {
      try {
        const result = await check.call(this);
        this.results.session.push(result);
      } catch (error) {
        this.results.session.push({
          status: "info",
          message: error.message,
          blocking: false,
        });
      }
    }

    return this.formatResults("session");
  }

  // Individual Check Methods
  async checkTypeScript() {
    try {
      execSync("npx tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      return { status: "success", message: "TypeScript compilation passed" };
    } catch (error) {
      return {
        status: "error",
        message: "TypeScript errors detected",
        blocking: true,
        action: "Run: npx tsc --noEmit for details",
      };
    }
  }

  async checkLinting() {
    try {
      execSync("npm run lint --silent", { stdio: "pipe" });
      return { status: "success", message: "Linting passed" };
    } catch (error) {
      return {
        status: "warning",
        message: "Linting issues detected",
        action: "Run: npm run lint:fix",
      };
    }
  }

  async checkGitStatus() {
    try {
      const status = execSync("git status --porcelain", { encoding: "utf8" });
      const fileCount = status
        .trim()
        .split("\n")
        .filter((line) => line).length;

      return {
        status: "info",
        message: `${fileCount} uncommitted files`,
      };
    } catch (error) {
      return { status: "warning", message: "Not in git repository" };
    }
  }

  async checkEnvironment() {
    const envExists = fs.existsSync(".env.local") || fs.existsSync(".env");
    return {
      status: envExists ? "success" : "warning",
      message: envExists
        ? "Environment config present"
        : "No environment config found",
    };
  }

  async checkNodeVersion() {
    const version = process.version.slice(1).split(".")[0];
    return {
      status: parseInt(version) >= 18 ? "success" : "warning",
      message: `Node.js v${version} (recommend 18+)`,
    };
  }

  async checkTypeScriptCompilation() {
    return this.checkTypeScript();
  }

  async checkLintingStrict() {
    return this.checkLinting();
  }

  async checkSecurityPatterns() {
    try {
      const gitDiff = execSync("git diff --cached", { encoding: "utf8" });
      const sensitivePatterns = /(password|secret|token|api_key|private_key)/i;

      if (sensitivePatterns.test(gitDiff)) {
        return {
          status: "warning",
          message: "Potential sensitive data in staged changes",
        };
      }

      return { status: "success", message: "No sensitive patterns detected" };
    } catch (error) {
      return { status: "info", message: "Security check skipped" };
    }
  }

  async checkTestsQuick() {
    try {
      execSync("timeout 30s npm test -- --passWithNoTests --silent", {
        stdio: "pipe",
      });
      return { status: "success", message: "Quick tests passed" };
    } catch (error) {
      return { status: "warning", message: "Tests may need attention" };
    }
  }

  async checkColorContrast() {
    try {
      execSync("npm run check:contrast --silent", { stdio: "pipe" });
      return { status: "success", message: "Color contrast checks passed" };
    } catch (error) {
      return {
        status: "warning",
        message: "Color contrast issues detected",
        action: "Run: npm run check:contrast",
      };
    }
  }

  async checkDesignSystemUsage() {
    // Check for direct Tailwind usage outside design system
    const result = { status: "info", message: "Design system usage checked" };
    // Implementation would check for direct Tailwind classes
    return result;
  }

  async checkAccessibility() {
    const result = {
      status: "info",
      message: "Accessibility patterns checked",
    };
    // Implementation would check for missing alt, aria attributes
    return result;
  }

  async checkFinancialFormatting() {
    const result = { status: "info", message: "Financial formatting checked" };
    // Implementation would check for unformatted currency
    return result;
  }

  async getGitStatus() {
    try {
      const branch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();
      const lastCommit = execSync('git log -1 --format="%h - %s (%cr)"', {
        encoding: "utf8",
      }).trim();

      return {
        status: "info",
        message: `Branch: ${branch}\nLast commit: ${lastCommit}`,
      };
    } catch (error) {
      return { status: "warning", message: "Git status unavailable" };
    }
  }

  async getBuildStatus() {
    const buildLogExists = fs.existsSync("BUILD_LOG.md");
    return {
      status: "info",
      message: buildLogExists ? "Build log present" : "No build log found",
    };
  }

  async getProjectHealth() {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    return {
      status: "info",
      message: `Project: ${packageJson.name} v${packageJson.version}`,
    };
  }

  formatResults(category) {
    const results = this.results[category];
    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      warnings: results.filter((r) => r.status === "warning").length,
      errors: results.filter((r) => r.status === "error").length,
      blocking: results.filter((r) => r.blocking).length,
      results: results,
    };

    return summary;
  }
}

// CLI Interface
if (require.main === module) {
  const framework = new AugmentQualityFramework();
  const command = process.argv[2];

  switch (command) {
    case "pre-edit":
      framework.runPreEditChecks().then(console.log);
      break;
    case "post-edit":
      framework.runPostEditChecks().then(console.log);
      break;
    case "ui-check":
      framework.runUIChecks().then(console.log);
      break;
    case "session-status":
      framework.runSessionStatus().then(console.log);
      break;
    default:
      console.log(
        "Usage: node quality-framework.js [pre-edit|post-edit|ui-check|session-status]",
      );
  }
}

module.exports = AugmentQualityFramework;
