import type { Metadata } from 'next'
import { pageTitle, SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

export const metadata: Metadata = {
  title: pageTitle('Get Started at LNPC | NESTRE Performance'),
  description: 'A 60-minute NESTRE consultation at Lake Nona Performance Club: 3-minute brain scan, Mindset Profile, and a one-on-one results review.',
  alternates: { canonical: `${SITE_URL}/get-started-at-lnpc` },
}

export default function GetStartedLNPC() {
  return <GetStartedBody location={GET_STARTED['/get-started-at-lnpc'].location} bookUrl={GET_STARTED['/get-started-at-lnpc'].bookUrl} surveyId={GET_STARTED['/get-started-at-lnpc'].surveyId} />
}
