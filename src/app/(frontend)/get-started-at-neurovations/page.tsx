import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GetStartedBody } from '@/components/GetStartedBody'

export const metadata: Metadata = {
  title: 'Get Started at Neurovations | NESTRE Performance',
  description: 'Schedule your NESTRE consultation at Neurovations — a 60-minute, one-on-one session with a brain scan, your NESTRE Mindset Profile, and a personalized results review.',
  alternates: { canonical: `${SITE_URL}/get-started-at-neurovations` },
}

export default function GetStartedNeurovations() {
  return <GetStartedBody location="Neurovations" acuityType="96663987" />
}
