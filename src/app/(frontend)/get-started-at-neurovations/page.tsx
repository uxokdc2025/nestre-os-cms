import type { Metadata } from 'next'
import { pageTitle, SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

export const metadata: Metadata = {
  title: pageTitle('Get Started at Neurovations | NESTRE Performance'),
  description: 'A 60-minute NESTRE consultation at Neurovations: 3-minute brain scan, Mindset Profile, and a one-on-one results review.',
  alternates: { canonical: `${SITE_URL}/get-started-at-neurovations` },
}

export default function GetStartedNeurovations() {
  return <GetStartedBody location={GET_STARTED['/get-started-at-neurovations'].location} bookUrl={GET_STARTED['/get-started-at-neurovations'].bookUrl} surveyId={GET_STARTED['/get-started-at-neurovations'].surveyId} />
}
