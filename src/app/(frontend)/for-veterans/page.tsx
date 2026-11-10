import type { Metadata } from 'next'
import { VeteransHero } from '@/components/VeteransHero'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Thank You Veterans · NESTRE' },
  description:
    'To every veteran who served, and to every human, your cognitive future is not fixed. There is more for you.',
  alternates: { canonical: `${SITE_URL}/for-veterans` },
  openGraph: {
    title: 'Thank You Veterans · NESTRE',
    description:
      'To every veteran who served, and to every human, your cognitive future is not fixed. There is more for you.',
    type: 'website',
    siteName: 'NESTRE',
    url: `${SITE_URL}/for-veterans`,
    images: [{ url: '/heroes/thank-you-veterans.png', width: 1600, height: 900, alt: 'American flag' }],
  },
}

// Code-driven landing page (same pattern as the event and schedule routes):
// the shared header and footer come from the frontend layout. No extra sections.
export default function ForVeteransPage() {
  return (
    <main id="main" data-page="for-veterans">
      <VeteransHero cta="consult" />
    </main>
  )
}
