import type { Metadata } from 'next'
import { ConsultFooterLink } from '@/components/ConsultFooterLink'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'NESTRE Holidays' },
  alternates: { canonical: `${SITE_URL}/nestre-holidays` },
  openGraph: {
    title: 'NESTRE Holidays',
    type: 'website',
    siteName: 'NESTRE',
    url: `${SITE_URL}/nestre-holidays`,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'NESTRE Holidays' }],
  },
}

// Shell page so the nav item resolves. No body copy, dates, or offers were
// provided — headline plus the existing Book / Learn more conversion only.
export default function NestreHolidaysPage() {
  return (
    <main id="main" data-page="nestre-holidays">
      <section className="hero holidays">
        <div className="grad" />
        <div className="wrap inner">
          <h1>NESTRE Holidays</h1>
          <div className="btns">
            <ConsultFooterLink className="btn aqua">Learn more</ConsultFooterLink>
          </div>
        </div>
      </section>
    </main>
  )
}
