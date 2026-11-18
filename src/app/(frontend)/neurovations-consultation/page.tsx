import type { Metadata } from 'next'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap.
export const metadata: Metadata = {
  title: { absolute: 'NESTRE · Book Your Initial Consultation at Neurovations' },
  description: 'Know your mind. Book your initial NESTRE consultation at Neurovations in Winter Park, Florida.',
  robots: { index: false, follow: false },
}

export default function NeurovationsConsultation() {
  return <AdLandingBody cfg={AD_LANDING['/neurovations-consultation']} />
}
