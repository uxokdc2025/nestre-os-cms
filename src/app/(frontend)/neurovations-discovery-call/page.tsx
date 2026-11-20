import type { Metadata } from 'next'
import { SITE_URL, ogFor } from '@/lib/seo'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap.
export const metadata: Metadata = {
  title: { absolute: 'NESTRE · Your starting point at Neurovations' },
  description:
    'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at Neurovations in Winter Park, Florida.',
  alternates: { canonical: `${SITE_URL}/neurovations-discovery-call` },
  openGraph: ogFor('/neurovations-discovery-call', 'NESTRE · Your starting point at Neurovations', 'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at Neurovations in Winter Park, Florida.'),
  robots: { index: false, follow: false },
}

export default function NeurovationsDiscoveryCall() {
  return <AdLandingBody cfg={AD_LANDING['/neurovations-discovery-call']} />
}
