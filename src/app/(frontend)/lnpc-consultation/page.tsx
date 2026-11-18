import type { Metadata } from 'next'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap.
export const metadata: Metadata = {
  title: { absolute: 'NESTRE · Book Your Initial Consultation at Lake Nona' },
  description: 'Know your mind. Book your initial NESTRE consultation at Lake Nona Performance Club.',
  robots: { index: false, follow: false },
}

export default function LnpcConsultation() {
  return <AdLandingBody cfg={AD_LANDING['/lnpc-consultation']} />
}
