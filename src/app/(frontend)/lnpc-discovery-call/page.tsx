import type { Metadata } from 'next'
import { SITE_URL, ogFor } from '@/lib/seo'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap.
export const metadata: Metadata = {
  title: { absolute: 'NESTRE · Your starting point at Lake Nona' },
  description:
    'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at Lake Nona Performance Club.',
  alternates: { canonical: `${SITE_URL}/lnpc-discovery-call` },
  openGraph: ogFor('/lnpc-discovery-call', 'NESTRE · Your starting point at Lake Nona', 'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at Lake Nona Performance Club.'),
  robots: { index: false, follow: false },
}

export default function LnpcDiscoveryCall() {
  return <AdLandingBody cfg={AD_LANDING['/lnpc-discovery-call']} />
}
