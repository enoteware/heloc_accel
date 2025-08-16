const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No basePath needed since we're using a subdomain
  // If deploying to a subdirectory, uncomment:
  // basePath: '/heloc',
  // assetPrefix: '/heloc',

  // Output configuration removed for Vercel deployment
  // output: 'standalone', // Only needed for self-hosting

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/photos/**",
      },
    ],
  },
  // Bundle analyzer (uncomment to analyze bundle size)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Force module resolution for ALL @/ imports to prevent Vercel build issues
    const path = require("path");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/app/actions/auth": path.resolve(__dirname, "src/app/actions/auth.ts"),
      "@/app/dashboard/page": path.resolve(
        __dirname,
        "src/app/dashboard/page.tsx",
      ),
      "@/auth": path.resolve(__dirname, "src/auth.ts"),
      "@/components/AuthProvider": path.resolve(
        __dirname,
        "src/components/AuthProvider.tsx",
      ),
      "@/components/CalculatorForm": path.resolve(
        __dirname,
        "src/components/CalculatorForm.tsx",
      ),
      "@/components/ConfirmationModals": path.resolve(
        __dirname,
        "src/components/ConfirmationModals.tsx",
      ),
      "@/components/DemoAccountsInfo": path.resolve(
        __dirname,
        "src/components/DemoAccountsInfo.tsx",
      ),
      "@/components/EnhancedCalculatorForm": path.resolve(
        __dirname,
        "src/components/EnhancedCalculatorForm.tsx",
      ),
      "@/components/Logo": path.resolve(__dirname, "src/components/Logo.tsx"),
      "@/components/PayoffChart": path.resolve(
        __dirname,
        "src/components/PayoffChart.tsx",
      ),
      "@/components/ResultsDisplay": path.resolve(
        __dirname,
        "src/components/ResultsDisplay.tsx",
      ),
      "@/components/design-system": path.resolve(
        __dirname,
        "src/components/design-system/index.ts",
      ),
      "@/components/design-system/Alert": path.resolve(
        __dirname,
        "src/components/design-system/Alert.tsx",
      ),
      "@/components/design-system/Button": path.resolve(
        __dirname,
        "src/components/design-system/Button.tsx",
      ),
      "@/components/design-system/Card": path.resolve(
        __dirname,
        "src/components/design-system/Card.tsx",
      ),
      "@/components/design-system/Input": path.resolve(
        __dirname,
        "src/components/design-system/Input.tsx",
      ),
      "@/components/design-system/Modal": path.resolve(
        __dirname,
        "src/components/design-system/Modal.tsx",
      ),
      "@/components/design-system/Progress": path.resolve(
        __dirname,
        "src/components/design-system/Progress.tsx",
      ),
      "@/components/design-system/Tooltip": path.resolve(
        __dirname,
        "src/components/design-system/Tooltip.tsx",
      ),
      "@/components/design-system/ValidatedInput": path.resolve(
        __dirname,
        "src/components/design-system/ValidatedInput.tsx",
      ),
      "@/components/form/FormFieldWithTooltip": path.resolve(
        __dirname,
        "src/components/form/FormFieldWithTooltip.tsx",
      ),
      "@/components/navigation": path.resolve(
        __dirname,
        "src/components/navigation/index.ts",
      ),
      "@/hooks/useCalculatorForm": path.resolve(
        __dirname,
        "src/hooks/useCalculatorForm.ts",
      ),
      "@/hooks/useFormValidation": path.resolve(
        __dirname,
        "src/hooks/useFormValidation.ts",
      ),
      "@/lib/api-url": path.resolve(__dirname, "src/lib/api-url.ts"),
      "@/lib/auth-utils": path.resolve(__dirname, "src/lib/auth-utils.ts"),
      "@/lib/calculations": path.resolve(__dirname, "src/lib/calculations.ts"),
      "@/lib/database": path.resolve(__dirname, "src/lib/database.ts"),
      "@/lib/demo-storage": path.resolve(__dirname, "src/lib/demo-storage.ts"),
      "@/lib/dummy-users": path.resolve(__dirname, "src/lib/dummy-users.ts"),
      "@/lib/form-validation": path.resolve(
        __dirname,
        "src/lib/form-validation.ts",
      ),
      "@/lib/rate-limit": path.resolve(__dirname, "src/lib/rate-limit.ts"),
      "@/lib/security-headers": path.resolve(
        __dirname,
        "src/lib/security-headers.ts",
      ),
      "@/lib/types": path.resolve(__dirname, "src/lib/types.ts"),
      "@/lib/utils": path.resolve(__dirname, "src/lib/utils.ts"),
      "@/lib/validation": path.resolve(__dirname, "src/lib/validation.ts"),
    };

    // Ensure module resolution works properly
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js", ".json"];

    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  // Headers for better caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Only use bundle analyzer in development when explicitly enabled
if (process.env.ANALYZE === "true" && process.env.NODE_ENV === "development") {
  try {
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    });
    module.exports = withNextIntl(withBundleAnalyzer(nextConfig));
  } catch (error) {
    console.warn("Bundle analyzer not available, using default config");
    module.exports = withNextIntl(nextConfig);
  }
} else {
  module.exports = withNextIntl(nextConfig);
}
