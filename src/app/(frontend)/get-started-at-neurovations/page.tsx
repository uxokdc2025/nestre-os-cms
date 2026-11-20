import type { Metadata } from 'next'
import { SITE_URL, pageTitle, ogFor, pageGraphs } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'
import { GET_STARTED } from '@/lib/get-started'

const DESCRIPTION =
  'A 60-minute NESTRE consultation at Neurovations: 3-minute brain scan, Mindset Profile, and a one-on-one results review.'

export const metadata: Metadata = {
  title: pageTitle('Get Started at Neurovations | NESTRE Performance'),
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/get-started-at-neurovations` },
  openGraph: ogFor('/get-started-at-neurovations', 'Get Started at Neurovations | NESTRE Performance', DESCRIPTION),
}

export default function GetStartedNeurovations() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraphs('Get Started at Neurovations', '/get-started-at-neurovations', DESCRIPTION)) }} />
      <GetStartedBody location={GET_STARTED['/get-started-at-neurovations'].location} bookUrl={GET_STARTED['/get-started-at-neurovations'].bookUrl} surveyId={GET_STARTED['/get-started-at-neurovations'].surveyId} />
    </>
  )
}
