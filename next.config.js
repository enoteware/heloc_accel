const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No basePath needed since we're using a subdomain
  // If deploying to a subdirectory, uncomment:
  // basePath: '/heloc',
  // assetPrefix: '/heloc',

  // Output configuration for Docker deployment
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  // Performance optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable compression
  compress: true,
  // Development performance improvements
  // Reduce compilation overhead
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
      "react-hook-form",
    ],
    // Faster builds
    webVitalsAttribution: ["CLS", "LCP"],
    // Reduce memory usage
    memoryBasedWorkersCount: true,
  },

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
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
    // Use TypeScript path mapping instead of manual aliases for better performance
    const path = require("path");
    const webpackLib = require("webpack");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Optional: allow offline builds by stubbing Google Fonts provider
    if (process.env.OFFLINE_FONTS === "1") {
      config.resolve.alias["next/font/google"] = path.resolve(
        __dirname,
        "src/mocks/next-font-google.js",
      );

      // Replace generated CSS requests from next/font with an empty CSS file
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpackLib.NormalModuleReplacementPlugin(
          /^next\/font\/google\/target\.css.*/,
          path.resolve(__dirname, "src/mocks/next-font-target.css"),
        ),
      );
    }

    // Ensure module resolution works properly
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js", ".json"];

    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;

      // Disable source maps for faster builds (enable only when debugging)
      config.devtool =
        process.env.ENABLE_SOURCE_MAPS === "true" ? "eval-source-map" : false;

      // Reduce file watching overhead
      config.watchOptions = {
        poll: false,
        ignored: [/node_modules/, /.next/, /.git/, /coverage/, /\.turbo/],
        aggregateTimeout: 300,
      };

      // Faster module resolution
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;

      // Reduce memory usage
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
    }

    // Rely on Next.js default optimizations for production to reduce build work
    // (custom splitChunks removed for faster builds)
    return config;
  },
  // Headers for better caching and custom domain support
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
          // CORS support for custom domain development
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ORIGIN || "http://localhost:3001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
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

// Injected content via Sentry wizard below (gated to production with token)
const { withSentryConfig } = require("@sentry/nextjs");

const enableSentry =
  process.env.VERCEL_ENV === "production" &&
  Boolean(process.env.SENTRY_AUTH_TOKEN);

if (enableSentry) {
  module.exports = withSentryConfig(module.exports, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "nds-2ap",
    project: "heloc-accel",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Keep uploads slimmer to reduce build time
    widenClientFileUpload: false,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // Note: This affects runtime, not build performance.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  });
}
