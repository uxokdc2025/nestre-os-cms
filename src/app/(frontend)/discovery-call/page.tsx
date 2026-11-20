import type { Metadata } from 'next'
import { SITE_URL, ogFor } from '@/lib/seo'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING, AD_LANDING_META } from '@/lib/ad-landing'

// Ad-only page (Chloe's short URL, Nov 20): noindex and deliberately left out of
// the sitemap. /lnpc-discovery-call and /neurovations-discovery-call 301 here
// (next.config.ts), keeping their query strings (UTMs).
const meta = AD_LANDING_META.discovery
const title = (meta.title as { absolute: string }).absolute
const description = meta.description ?? undefined
export const metadata: Metadata = {
  ...meta,
  alternates: { canonical: `${SITE_URL}/discovery-call` },
  openGraph: ogFor('/discovery-call', title, description),
  robots: { index: false, follow: false },
}

export default function DiscoveryCall() {
  return <AdLandingBody cfg={AD_LANDING['/discovery-call']} />
}
