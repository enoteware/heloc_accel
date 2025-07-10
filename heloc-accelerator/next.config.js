/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for subdirectory deployment
  basePath: '/heloc',
  assetPrefix: '/heloc',
  trailingSlash: true,

  // Output configuration for standalone deployment
  output: 'standalone',
}

module.exports = nextConfig
