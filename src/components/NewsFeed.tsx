'use client'
import React, { useMemo, useState } from 'react'

export type NewsCard = {
  id: number
  type: 'news' | 'event'
  title: string
  category?: string
  source?: string
  date: string
  dateLabel: string
  startsAtLabel?: string
  venue?: string
  summary?: string
  url?: string
  image?: string
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'News' },
  { key: 'events', label: 'Events' },
] as const

const PAGE = 9

export function NewsFeed({ items }: { items: NewsCard[] }) {
  const [tab, setTab] = useState<'all' | 'news' | 'events'>('all')
  const [count, setCount] = useState(PAGE)

  const filtered = useMemo(() => {
    const f = tab === 'all' ? items : items.filter((i) => (tab === 'events' ? i.type === 'event' : i.type === 'news'))
    return f
  }, [items, tab])

  const shown = filtered.slice(0, count)

  return (
    <div className="news-feed">
      <div className="news-tabs" role="tablist" aria-label="Filter">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={`news-tab${tab === t.key ? ' on' : ''}`}
            onClick={() => { setTab(t.key); setCount(PAGE) }}>
            {t.label}
            <span className="news-tab-n">{t.key === 'all' ? items.length : items.filter((i) => (t.key === 'events' ? i.type === 'event' : i.type === 'news')).length}</span>
          </button>
        ))}
      </div>

      <div className="news-grid">
        {shown.map((n) => {
          const isEvent = n.type === 'event'
          return (
            <a key={n.id} href={n.url || '#'} target={n.url?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`ncard${isEvent ? ' event' : ''}`}>
              <div className="ncard-media">
                {n.image ? <img src={n.image} alt="" loading="lazy" /> : <div className="ncard-media-fallback" aria-hidden />}
                <span className={`ncard-badge${isEvent ? ' event' : ''}`}>{isEvent ? 'Event' : 'News'}</span>
              </div>
              <div className="ncard-body">
                {isEvent && (n.startsAtLabel || n.venue) && (
                  <div className="nevent-when">
                    {n.startsAtLabel && <span className="nevent-date">{n.startsAtLabel}</span>}
                    {n.venue && <span className="nevent-venue">{n.venue}</span>}
                  </div>
                )}
                {!isEvent && <div className="ncard-meta">{n.category ? <span className="ncard-cat">{n.category}</span> : null}{n.source ? `${n.source} · ` : ''}{n.dateLabel}</div>}
                <h3 className="ncard-title">{n.title}</h3>
                {n.summary && <p className="ncard-excerpt">{n.summary}</p>}
                <span className="ncard-more">{isEvent ? 'Details' : 'Read the story'} <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
              </div>
            </a>
          )
        })}
      </div>

      {count < filtered.length && (
        <div className="news-more-wrap">
          <button className="btn aqua news-more" onClick={() => setCount((c) => c + PAGE)}>Load more</button>
        </div>
      )}
      {filtered.length === 0 && <p className="news-empty">Nothing here yet — check back soon.</p>}
    </div>
  )
}
