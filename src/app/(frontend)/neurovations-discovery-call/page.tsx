import type { Metadata } from 'next'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap.
export const metadata: Metadata = {
  title: { absolute: 'NESTRE · Your starting point at Neurovations' },
  description:
    'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at Neurovations in Winter Park, Florida.',
  robots: { index: false, follow: false },
}

export default function NeurovationsDiscoveryCall() {
  return <AdLandingBody cfg={AD_LANDING['/neurovations-discovery-call']} />
}
