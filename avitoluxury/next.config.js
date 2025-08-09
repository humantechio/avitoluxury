/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add environment variables that are safe to expose to the client
  // Do NOT include sensitive information here - use .env.local for those
  env: {
    GOOGLE_STORAGE_BUCKET_NAME: process.env.GOOGLE_STORAGE_BUCKET_NAME || 'ecommerce-app-444531.appspot.com',
    GOOGLE_STORAGE_PROJECT_ID: process.env.GOOGLE_STORAGE_PROJECT_ID || 'ecommerce-app-444531',
    // Removed sensitive information - these should be loaded from .env.local only
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
  // Handle Node.js modules in webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  async redirects() {
    // Basic redirects that apply in all environments
    const redirects = [
      {
        source: '/store',
        destination: '/store-routes/store',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/store-routes/store/:path*',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/store-routes/product/:path*',
        permanent: true,
      },
      // Add root redirect to store
      {
        source: '/',
        destination: '/store-routes/store',
        permanent: false,
      }
    ];

    // Add production-only domain-based redirects
    if (process.env.NODE_ENV === 'production') {
      // Admin redirects from main domain to admin subdomain
      redirects.push({
        source: '/admin/:path*',
        has: [
          {
            type: 'host',
            value: 'avitoluxury.in'
          }
        ],
        destination: 'https://admin.avitoluxury.in/admin/:path*',
        permanent: true
      });
      
      redirects.push({
        source: '/admin/:path*',
        has: [
          {
            type: 'host',
            value: 'www.avitoluxury.in'
          }
        ],
        destination: 'https://admin.avitoluxury.in/admin/:path*',
        permanent: true
      });
      
      // Non-admin redirects from admin subdomain to main domain
      redirects.push({
        source: '/((?!admin|_next).*)',
        has: [
          {
            type: 'host',
            value: 'admin.avitoluxury.in'
          }
        ],
        destination: 'https://avitoluxury.in/:path*',
        permanent: true
      });
      
      // Root admin subdomain to admin login
      redirects.push({
        source: '/',
        has: [
          {
            type: 'host',
            value: 'admin.avitoluxury.in'
          }
        ],
        destination: 'https://admin.avitoluxury.in/admin/login',
        permanent: false
      });
      
      // www to non-www redirect
      redirects.push({
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.avitoluxury.in'
          }
        ],
        destination: 'https://avitoluxury.in/:path*',
        permanent: true
      });
    }
    
    return redirects;
  },
  // Domain configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 