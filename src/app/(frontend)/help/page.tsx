import type { Metadata } from 'next'
import React from 'react'
import { Reveal } from '@/components/Reveal'
import { HELP } from '@/lib/help-content'
import { SITE_URL, webPageGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Help & Support',
  description: 'Get help with the NESTRE app — contact support, manage your subscription, or delete your account.',
  alternates: { canonical: `${SITE_URL}/help` },
  openGraph: { title: 'Help & Support · NESTRE', url: `${SITE_URL}/help`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Help & Support · NESTRE', images: ['/og'] },
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
  HELP.forEach((b, i) => {
    if (b.t === 'li') { list.push(b.x); return }
    flush(`ul-${i}`)
    if (b.t === 'h2') out.push(<h2 key={i}>{b.x}</h2>)
    else if (b.t === 'h3') out.push(<h3 key={i}>{b.x}</h3>)
    else out.push(<p key={i}>{b.x}</p>)
  })
  flush('ul-end')
  return out
}

export default async function HelpPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageGraph('Help & Support', '/help', 'Get help with the NESTRE app — contact support, manage your subscription, or delete your account.')) }} />
      <main id="main" className="legal-page">
        <section className="sec paper">
          <div className="wrap legal">
            <p className="eyebrow">Support</p>
            <h1 className="h2" style={{ marginTop: 12 }}>Help &amp; Support</h1>
            <div className="legal-body">{renderBody()}</div>
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
