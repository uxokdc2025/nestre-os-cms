import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

export const metadata: Metadata = {
  title: { absolute: 'Consultation Promo at Lake Nona Performance Club' },
  description: 'Schedule your NESTRE consultation at Lake Nona Performance Club — a 60-minute, one-on-one session with a brain scan, your NESTRE Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/lnpc-event-consultation-offer` },
}

export default function GetStartedLnpcEventOffer() {
  return <GetStartedBody location={GET_STARTED['/lnpc-event-consultation-offer'].location} bookUrl={GET_STARTED['/lnpc-event-consultation-offer'].bookUrl} />
}
