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
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Bundle analyzer (uncomment to analyze bundle size)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Force module resolution for problematic imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components/DemoAccountsInfo': require.resolve('./src/components/DemoAccountsInfo.tsx'),
      '@/components/CalculatorForm': require.resolve('./src/components/CalculatorForm.tsx'),
      '@/components/Logo': require.resolve('./src/components/Logo.tsx'),
      '@/lib/demo-storage': require.resolve('./src/lib/demo-storage.ts'),
      '@/lib/api-url': require.resolve('./src/lib/api-url.ts'),
    }

    // Ensure module resolution works properly
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json']
    
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    return config
  },
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

// Only use bundle analyzer in development when explicitly enabled
if (process.env.ANALYZE === 'true' && process.env.NODE_ENV === 'development') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    })
    module.exports = withBundleAnalyzer(nextConfig)
  } catch (error) {
    console.warn('Bundle analyzer not available, using default config')
    module.exports = nextConfig
  }
} else {
  module.exports = nextConfig
}
