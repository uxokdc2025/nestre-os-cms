'use client'

import React, { useState } from 'react'

// One NESTRE location. `x`/`y` are the marker position on the stylised map,
// expressed as a percentage of the panel (0–100). When a live Mapbox token is
// added later (NEXT_PUBLIC_MAPBOX_TOKEN), this component can be swapped for a
// real map without changing the card list or the block's data shape.
export type LocationItem = {
  name: string
  address?: string
  miles?: string
  hours?: string
  earliest?: string
  image?: string | null
  alt?: string
  x?: number
  y?: number
  viewHref?: string
  bookHref?: string
}

const DEFAULTS: LocationItem[] = [
  { name: 'Lake Nona', address: '6775 Chopra Ter, Orlando, FL 32827', miles: '3.1 miles away', hours: 'Open now', earliest: '11:00am', x: 33, y: 58, viewHref: '#', bookHref: '/book-a-consultation' },
  { name: 'Winter Park', address: '2200 Lee Rd, Winter Park, FL 32789', miles: '5.2 miles away', hours: 'Open now', earliest: '11:00am', x: 55, y: 33, viewHref: '#', bookHref: '/book-a-consultation' },
  { name: 'Monterey', address: '5 Harris Ct Bldg. T, Suite 102, Monterey, CA 93940', miles: '3,010 miles away', hours: 'Open now', earliest: '11:00am', x: 77, y: 63, viewHref: '#', bookHref: '/book-a-consultation' },
]

export function LocationsMap({
  eyebrow,
  heading,
  body,
  items,
}: {
  eyebrow?: string
  heading?: string
  body?: string
  items?: LocationItem[]
}) {
  const locs = items && items.length ? items : DEFAULTS
  const [active, setActive] = useState(0)
  const current = locs[Math.min(active, locs.length - 1)]

  return (
    <section className="sec paper locations-sec">
      <div className="wrap">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{heading}</h2>}
        {body && <p className="lead muted">{body}</p>}

        <div className="loc2-layout">
          {/* selectable location cards */}
          <div className="loc2-list" role="listbox" aria-label="NESTRE locations">
            {locs.map((l, i) => {
              const on = i === active
              const initials = l.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
              return (
                <div
                  key={i}
                  className={`loc2-card${on ? ' on' : ''}`}
                  role="option"
                  aria-selected={on}
                  tabIndex={0}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i) }
                  }}
                >
                  <div className="loc2-media">
                    {l.image ? <img src={l.image} alt={l.alt || l.name} /> : <span className="loc2-media-ph" aria-hidden>{initials}</span>}
                  </div>
                  <div className="loc2-body">
                    <div className="loc2-head">
                      <h3>{l.name}</h3>
                      {l.miles && <span className="loc2-miles">{l.miles}</span>}
                    </div>
                    {l.address && <p className="loc2-addr">{l.address}</p>}
                    {l.hours && <p className="loc2-hours">{l.hours}</p>}
                    {l.earliest && (
                      <div className="loc2-appt">
                        <span className="loc2-pill">{l.earliest}</span>
                        <span className="loc2-appt-lab">Earliest appointment</span>
                      </div>
                    )}
                    <div className="loc2-btns">
                      <a className="btn outline" href={l.viewHref || '#'} onClick={(e) => e.stopPropagation()}>View Location</a>
                      <a className="btn solid" href={l.bookHref || '#'} onClick={(e) => e.stopPropagation()}>Book Training</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* stylised brand map — markers reposition-focus on selection */}
          <div className="loc2-map">
            <svg className="loc2-grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
              ))}
            </svg>
            <span className="loc2-focus" style={{ left: `${current.x ?? 50}%`, top: `${current.y ?? 50}%` }} aria-hidden />
            {locs.map((l, i) => {
              const on = i === active
              return (
                <button
                  key={i}
                  type="button"
                  className={`loc2-pin${on ? ' on' : ''}`}
                  style={{ left: `${l.x ?? 50}%`, top: `${l.y ?? 50}%` }}
                  onClick={() => setActive(i)}
                  aria-label={`Show ${l.name}`}
                  aria-pressed={on}
                >
                  <span className="loc2-pin-dot" />
                  <span className="loc2-pin-label">{l.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
