// Minimal stub for next/font/google to enable offline builds in CI/sandbox
// Usage: set OFFLINE_FONTS=1 to route imports here via webpack alias.

function stub() {
  return { className: "" };
}

module.exports = {
  Inter: stub,
  Roboto: stub,
  // Add other font names if needed
};
