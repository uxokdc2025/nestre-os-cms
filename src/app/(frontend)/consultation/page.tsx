import type { Metadata } from 'next'
import { SITE_URL, ogFor } from '@/lib/seo'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING, AD_LANDING_META } from '@/lib/ad-landing'

// Ad-only page (Chloe's short URL, Nov 20): noindex and deliberately left out of
// the sitemap. /lnpc-consultation and /neurovations-consultation 301 here
// (next.config.ts), keeping their query strings (UTMs).
const meta = AD_LANDING_META.consultation
const title = (meta.title as { absolute: string }).absolute
const description = meta.description ?? undefined
export const metadata: Metadata = {
  ...meta,
  alternates: { canonical: `${SITE_URL}/consultation` },
  openGraph: ogFor('/consultation', title, description),
  robots: { index: false, follow: false },
}

export default function Consultation() {
  return <AdLandingBody cfg={AD_LANDING['/consultation']} />
}
