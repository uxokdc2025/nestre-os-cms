import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Reveal } from '@/components/Reveal'
import { NewsFeed, type NewsCard } from '@/components/NewsFeed'
import { SITE_URL } from '@/lib/seo'

/* eslint-disable @typescript-eslint/no-explicit-any */
const fmtDay = (d: string) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')
const fmtWhen = (d: string) => (d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '')

async function getItems(): Promise<NewsCard[]> {
  try {
    const payload = await getPayload({ config: await config })
    const res = await payload.find({ collection: 'news', where: { published: { equals: true } }, sort: '-date', limit: 200, depth: 1 })
    return (res.docs as any[]).map((n) => ({
      id: n.id,
      type: n.type === 'event' ? 'event' : 'news',
      title: n.title,
      category: n.category || '',
      source: n.source || '',
      date: n.date,
      dateLabel: fmtDay(n.date),
      startsAtLabel: n.startsAt ? fmtWhen(n.startsAt) : '',
      venue: n.venue || '',
      summary: n.summary || '',
      url: n.url || '',
      image: n.image?.url || '',
    }))
  } catch { return [] }
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News & Events',
  description: 'Press, partnerships, research collaborations, and upcoming events from NESTRE Health & Performance.',
  alternates: { canonical: `${SITE_URL}/news` },
  openGraph: { title: 'NESTRE — News & Events', url: `${SITE_URL}/news`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'NESTRE — News & Events', images: ['/og'] },
}

function jsonLd(items: NewsCard[]) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'NESTRE — News & Events',
    itemListElement: items.map((n, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': n.type === 'event' ? 'Event' : 'NewsArticle', name: n.title, headline: n.title, ...(n.url ? { url: n.url } : {}), datePublished: n.date, ...(n.type === 'event' && n.venue ? { location: { '@type': 'Place', name: n.venue } } : {}), about: { '@id': `${SITE_URL}/#org` } },
    })),
  }
}

export default async function NewsPage() {
  const items = await getItems()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(items)) }} />
      <main id="main">
        <section className="sec navy news-hero">
          <div className="wrap">
            <p className="eyebrow">News &amp; Events</p>
            <h1 className="h2" style={{ marginTop: 14 }}>NESTRE, in the world.</h1>
            <p className="lead" style={{ color: 'rgba(255,255,255,.78)' }}>Partnerships, research, and the moments where the science of cognitive performance meets the people living it.</p>
          </div>
        </section>
        <section className="sec paper">
          <div className="wrap">
            <NewsFeed items={items} />
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
