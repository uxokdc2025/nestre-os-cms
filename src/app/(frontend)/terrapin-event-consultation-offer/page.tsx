import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

const CFG = GET_STARTED['/terrapin-event-consultation-offer']

export const metadata: Metadata = {
  title: { absolute: 'Consultation Promo at Terrapin Physical Therapy' },
  description: 'Schedule your NESTRE consultation at Terrapin Physical Therapy in Monterey, CA — a 60-minute, one-on-one session with a brain scan, your NESTRE Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/terrapin-event-consultation-offer` },
}

export default function GetStartedTerrapinEventOffer() {
  return <GetStartedBody location={CFG.location} bookUrl={CFG.bookUrl} priceNow={CFG.priceNow} priceWas={CFG.priceWas} />
}
