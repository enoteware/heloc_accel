module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Temporarily disable these for development
    "@next/next/no-html-link-for-pages": "warn",
    "react/no-unescaped-entities": "warn",
    "react-hooks/exhaustive-deps": "warn",
  },
};
