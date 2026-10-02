import type { Metadata } from 'next'
import { Reveal } from '@/components/Reveal'
import { SITE_URL, webPageGraph } from '@/lib/seo'
import { CareersDrawer } from '@/components/CareersDrawer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Careers at NESTRE',
  description: 'Interested in joining NESTRE? Share your background and career interests — our Talent Acquisition team reviews submissions as opportunities become available.',
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: { title: 'Careers at NESTRE', url: `${SITE_URL}/careers`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Careers at NESTRE', images: ['/og'] },
}

export default function CareersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageGraph('Careers at NESTRE', '/careers', 'Share your background and career interests with NESTRE.')) }} />
      <main id="main">
        {/* Hero */}
        <section className="sec navy careers-hero">
          <div className="wrap">
            <p className="eyebrow">Careers at NESTRE</p>
            <h1 className="h2" style={{ marginTop: 16, maxWidth: '16ch' }}>Build human performance with us.</h1>
            <p className="lead" style={{ color: 'rgba(255,255,255,.82)', marginTop: 18, maxWidth: '56ch' }}>
              Interested in joining NESTRE? Share your background and career interests. Our Talent
              Acquisition team will review your information as opportunities become available.
            </p>
            <div className="btns" style={{ marginTop: 26 }}>
              <CareersDrawer label="Share your interest" className="btn aqua" />
            </div>
          </div>
        </section>

        {/* Supporting band */}
        <section className="sec paper">
          <div className="wrap legal">
            <p className="careers-note">
              This form is for general career interest and is not an application for a specific position.
              Please do not include medical information, Social Security numbers, financial information, or
              other sensitive personal data.
            </p>
            <div style={{ marginTop: 22 }}>
              <CareersDrawer label="Share your interest" className="btn aqua" />
            </div>
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
