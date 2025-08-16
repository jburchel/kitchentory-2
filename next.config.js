// Import security configuration
const { SECURITY_HEADERS, generateCSP } = require('./src/config/security.ts')

// Conditional bundle analyzer import for development
let withBundleAnalyzer
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
} catch (error) {
  // Bundle analyzer not available in production, use identity function
  withBundleAnalyzer = (config) => config
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'img.clerk.com', 
      'images.clerk.dev',
      'images.unsplash.com',
      'source.unsplash.com',
      'spoonacular.com',
      'img.spoonacular.com',
      'via.placeholder.com',
      'images.pexels.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        port: '',
        pathname: '/recipeImages/**',
      },
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          ...SECURITY_HEADERS,
          {
            key: 'Content-Security-Policy',
            value: generateCSP().replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      // API versioning
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false, // Disable source maps in production
  swcMinify: true, // Use SWC for minification (faster)
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\/]node_modules[\/](react|react-dom)[\/]/,
            name: 'react',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
