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
    // Force module resolution for ALL @/ imports to prevent Vercel build issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app/actions/auth': require.resolve('./src/app/actions/auth.ts'),
      '@/app/dashboard/page': require.resolve('./src/app/dashboard/page.tsx'),
      '@/auth': require.resolve('./src/auth.ts'),
      '@/components/AuthProvider': require.resolve('./src/components/AuthProvider.tsx'),
      '@/components/CalculatorForm': require.resolve('./src/components/CalculatorForm.tsx'),
      '@/components/ConfirmationModals': require.resolve('./src/components/ConfirmationModals.tsx'),
      '@/components/DemoAccountsInfo': require.resolve('./src/components/DemoAccountsInfo.tsx'),
      '@/components/EnhancedCalculatorForm': require.resolve('./src/components/EnhancedCalculatorForm.tsx'),
      '@/components/Logo': require.resolve('./src/components/Logo.tsx'),
      '@/components/PayoffChart': require.resolve('./src/components/PayoffChart.tsx'),
      '@/components/ResultsDisplay': require.resolve('./src/components/ResultsDisplay.tsx'),
      '@/components/design-system': require.resolve('./src/components/design-system/index.ts'),
      '@/components/design-system/Alert': require.resolve('./src/components/design-system/Alert.tsx'),
      '@/components/design-system/Button': require.resolve('./src/components/design-system/Button.tsx'),
      '@/components/design-system/Card': require.resolve('./src/components/design-system/Card.tsx'),
      '@/components/design-system/Input': require.resolve('./src/components/design-system/Input.tsx'),
      '@/components/design-system/Modal': require.resolve('./src/components/design-system/Modal.tsx'),
      '@/components/design-system/Progress': require.resolve('./src/components/design-system/Progress.tsx'),
      '@/components/design-system/Tooltip': require.resolve('./src/components/design-system/Tooltip.tsx'),
      '@/components/design-system/ValidatedInput': require.resolve('./src/components/design-system/ValidatedInput.tsx'),
      '@/components/form/FormFieldWithTooltip': require.resolve('./src/components/form/FormFieldWithTooltip.tsx'),
      '@/components/navigation': require.resolve('./src/components/navigation/index.ts'),
      '@/hooks/useCalculatorForm': require.resolve('./src/hooks/useCalculatorForm.ts'),
      '@/hooks/useFormValidation': require.resolve('./src/hooks/useFormValidation.ts'),
      '@/lib/api-url': require.resolve('./src/lib/api-url.ts'),
      '@/lib/auth-utils': require.resolve('./src/lib/auth-utils.ts'),
      '@/lib/calculations': require.resolve('./src/lib/calculations.ts'),
      '@/lib/database': require.resolve('./src/lib/database.ts'),
      '@/lib/demo-storage': require.resolve('./src/lib/demo-storage.ts'),
      '@/lib/dummy-users': require.resolve('./src/lib/dummy-users.ts'),
      '@/lib/form-validation': require.resolve('./src/lib/form-validation.ts'),
      '@/lib/rate-limit': require.resolve('./src/lib/rate-limit.ts'),
      '@/lib/security-headers': require.resolve('./src/lib/security-headers.ts'),
      '@/lib/types': require.resolve('./src/lib/types.ts'),
      '@/lib/utils': require.resolve('./src/lib/utils.ts'),
      '@/lib/validation': require.resolve('./src/lib/validation.ts'),
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
