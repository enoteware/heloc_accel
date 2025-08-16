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
  // Development performance improvements
  // Reduce compilation overhead
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "recharts"],
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
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Ensure module resolution works properly
    config.resolve.extensions = [".tsx", ".ts", ".jsx", ".js", ".json"];

    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;

      // Reduce file watching overhead
      config.watchOptions = {
        poll: false,
        ignored: /node_modules/,
      };
    }

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
