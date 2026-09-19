import type { Metadata } from 'next'
import { OurStoryV3 } from '@/components/OurStoryV3'

// /our-story-v3 — scrollytelling review build. Noindexed.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Our Story — v3 (review)',
  robots: { index: false, follow: false },
}

export default function OurStoryV3Page() {
  return (
    <main id="main">
      <OurStoryV3 />
    </main>
  )
}
