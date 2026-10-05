import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

export const metadata: Metadata = {
  title: 'Get Started at Neurovations | NESTRE Performance',
  description: 'Schedule your NESTRE consultation at Neurovations — a 60-minute, one-on-one session with a brain scan, your NESTRE Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/neurovations-event-consultation-offer` },
}

export default function GetStartedNeurovationsEventOffer() {
  return <GetStartedBody location={GET_STARTED['/neurovations-event-consultation-offer'].location} bookUrl={GET_STARTED['/neurovations-event-consultation-offer'].bookUrl} />
}
