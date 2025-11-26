import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Enable .html extension support
  trailingSlash: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Rewrite .html URLs to their original routes
  async rewrites() {
    return [
      {
        source: '/:locale/:path*.html',
        destination: '/:locale/:path*',
      },
      {
        source: '/:path*.html',
        destination: '/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
