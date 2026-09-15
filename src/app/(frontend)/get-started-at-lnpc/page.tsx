import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'

export const metadata: Metadata = {
  title: 'Get Started at LNPC | NESTRE Performance',
  description: 'Schedule your NESTRE consultation at Lake Nona Performance Club — a 60-minute, one-on-one session with a brain scan, your Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/get-started-at-lnpc` },
}

export default function GetStartedLNPC() {
  return <GetStartedBody location="Lake Nona Performance Club" acuityType="96663934" />
}
