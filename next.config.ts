import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/minio/:path*',
        destination: 'http://vps-panel-minio:9000/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin-panel',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: '/admin-panel/:path*',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.fodivps2.cloud',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.hostingersite.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Static assets cache
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Frontend pages: strict CSP without unsafe-eval
        source: '/((?!admin).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://storage.fodivps2.cloud https://maps.googleapis.com",
              "frame-src 'self' https://maps.google.com https://www.google.com https://maps.googleapis.com https://*.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        // Payload admin: needs unsafe-eval for Lexical editor
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://storage.fodivps2.cloud",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withNextIntl(withPayload(nextConfig))
