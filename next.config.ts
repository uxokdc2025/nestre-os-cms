import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Legacy WordPress URLs that 404 today. Exact sources only — no wildcards, because
  // /nestre-app/help, /nestre-app/privacy and /nestre-app/tandc are live pages the
  // mobile app links to. statusCode: 301 (permanent: true would emit a 308).
  async redirects() {
    const map: [string, string][] = [
      ['/about', '/our-story'],
      ['/solutions', '/how-it-works'],
      ['/neurostrength-training', '/neuro-labs'],
      ['/nestre-app', '/the-app'],
      ['/destination-packages', '/'],
      ['/results', '/how-it-works'],
      ['/the-science-of-better', '/how-it-works'],
      ['/partner-with-nestre', '/for-teams'],
      ['/privacy-policy', '/privacy'],
      ['/golfusion', '/'],
      ['/nacda', '/'],
      ['/va-simlearn', '/'],
      ['/mindset-profile', '/'],
      ['/nestre-news', '/news'],
      ['/wp-content/uploads/2021/10/Dr.-Tommy-Shavers-Bio.pdf', '/our-story'],
      // Ad landing pages: the per-location URLs moved to one short URL per variant
      // (Chloe, Nov 20). Next.js carries the query string (UTMs) across.
      ['/lnpc-discovery-call', '/discovery-call'],
      ['/neurovations-discovery-call', '/discovery-call'],
      ['/lnpc-consultation', '/consultation'],
      ['/neurovations-consultation', '/consultation'],
    ]
    return map.map(([source, destination]) => ({ source, destination, statusCode: 301 }))
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
