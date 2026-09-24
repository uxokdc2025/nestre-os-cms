import type { Metadata } from 'next'
import React from 'react'
import { Reveal } from '@/components/Reveal'
import { TERMS, TERMS_UPDATED } from '@/lib/terms-content'
import { SITE_URL, webPageGraph } from '@/lib/seo'

// NESTRE app Terms & Conditions at the exact URL the mobile app links to
// (/nestre-app/tandc). Same legally-approved text as /terms, on the shared
// legal-page pattern.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms and conditions governing your use of the NESTRE app and services.',
  alternates: { canonical: `${SITE_URL}/nestre-app/tandc` },
  openGraph: { title: 'Terms & Conditions · NESTRE', url: `${SITE_URL}/nestre-app/tandc`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Terms & Conditions · NESTRE', images: ['/og'] },
}

// Group consecutive list items so they render inside a single <ul>.
function renderBody() {
  const out: React.ReactNode[] = []
  let list: string[] = []
  const flush = (key: string) => {
    if (list.length) {
      out.push(<ul key={key}>{list.map((t, i) => <li key={i}>{t}</li>)}</ul>)
      list = []
    }
  }
  TERMS.forEach((b, i) => {
    if (b.t === 'li') { list.push(b.x); return }
    flush(`ul-${i}`)
    if (b.t === 'h2') out.push(<h2 key={i}>{b.x}</h2>)
    else if (b.t === 'h3') out.push(<h3 key={i}>{b.x}</h3>)
    else if (b.x === 'Terms and Conditions' || b.x.startsWith('Last updated')) return // shown in the header
    else out.push(<p key={i}>{b.x}</p>)
  })
  flush('ul-end')
  return out
}

export default function NestreAppTandcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageGraph('Terms & Conditions', '/nestre-app/tandc', 'The terms and conditions governing your use of the NESTRE app and services.')) }} />
      <main id="main" className="legal-page">
        <section className="sec paper">
          <div className="wrap legal">
            <p className="eyebrow">Legal</p>
            <h1 className="h2" style={{ marginTop: 12 }}>Terms &amp; Conditions</h1>
            <p className="muted" style={{ marginTop: 10 }}>Last updated: {TERMS_UPDATED}</p>
            <div className="legal-body">{renderBody()}</div>
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
