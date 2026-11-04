import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

export const metadata: Metadata = {
  title: { absolute: 'Consultation Promo at Terrapin Physical Therapy' },
  description: 'Schedule your NESTRE consultation at Terrapin Physical Therapy — a 60-minute, one-on-one session with a brain scan, your NESTRE Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/terrapin-event-consultation-offer` },
}

export default function GetStartedTerrapinEventOffer() {
  const cfg = GET_STARTED['/terrapin-event-consultation-offer']
  return <GetStartedBody location={cfg.location} bookUrl={cfg.bookUrl} priceNow={cfg.priceNow} priceWas={cfg.priceWas} />
}
