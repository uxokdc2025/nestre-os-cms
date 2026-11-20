import type { Metadata } from 'next'
import { SITE_URL, pageTitle, ogFor, pageGraphs } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

const DESCRIPTION =
  'A 60-minute NESTRE consultation at Lake Nona Performance Club: 3-minute brain scan, Mindset Profile, and a one-on-one results review.'

export const metadata: Metadata = {
  title: pageTitle('Get Started at LNPC | NESTRE Performance'),
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/get-started-at-lnpc` },
  openGraph: ogFor('/get-started-at-lnpc', 'Get Started at LNPC | NESTRE Performance', DESCRIPTION),
}

export default function GetStartedLNPC() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraphs('Get Started at LNPC', '/get-started-at-lnpc', DESCRIPTION)) }} />
      <GetStartedBody location={GET_STARTED['/get-started-at-lnpc'].location} bookUrl={GET_STARTED['/get-started-at-lnpc'].bookUrl} surveyId={GET_STARTED['/get-started-at-lnpc'].surveyId} />
    </>
  )
}
