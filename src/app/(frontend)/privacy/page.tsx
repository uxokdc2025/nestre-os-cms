import type { Metadata } from 'next'
import { Reveal } from '@/components/Reveal'
import { PRIVACY, PRIVACY_UPDATED } from '@/lib/privacy-content'
import { SITE_URL, webPageGraph } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How NESTRE Health & Performance collects, uses, and protects your personal information.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: { title: 'Privacy Policy · NESTRE', url: `${SITE_URL}/privacy`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Privacy Policy · NESTRE', images: ['/og'] },
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
  PRIVACY.forEach((b, i) => {
    if (b.t === 'li') { list.push(b.x); return }
    flush(`ul-${i}`)
    if (b.t === 'h2') out.push(<h2 key={i}>{b.x}</h2>)
    else if (b.t === 'h3') out.push(<h3 key={i}>{b.x}</h3>)
    else if (b.x === 'Privacy Policy' || b.x.startsWith('Last updated')) return // shown in the header
    else out.push(<p key={i}>{b.x}</p>)
  })
  flush('ul-end')
  return out
}

export default async function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageGraph('Privacy Policy', '/privacy', 'How NESTRE Health & Performance collects, uses, and protects your personal information.')) }} />
      <main id="main" className="legal-page">
        <section className="sec paper">
          <div className="wrap legal">
            <p className="eyebrow">Legal</p>
            <h1 className="h2" style={{ marginTop: 12 }}>Privacy Policy</h1>
            <p className="muted" style={{ marginTop: 10 }}>Last updated: {PRIVACY_UPDATED}</p>
            <div className="legal-body">{renderBody()}</div>
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
