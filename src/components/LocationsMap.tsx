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
  map?: string | null
  mapPos?: string // background-position to center the marker on the wide map crop
  x?: number
  y?: number
  viewHref?: string
  bookHref?: string
}

const DEFAULTS: LocationItem[] = [
  // Images point at the SAME CMS media the /neuro-labs block uses, so both places
  // render identical location photos from one source. Maps stay as shipped crops.
  { name: 'Lake Nona', address: '6775 Chopra Ter, Orlando, FL 32827', miles: '3.1 miles away', hours: 'Open now', earliest: '11:00am', image: '/api/media/file/lnpc-lake-nona.jpg', map: '/img/locations/lake-nona-map.png', mapPos: '50% 78%', viewHref: '#', bookHref: '/book-a-consultation' },
  { name: 'Winter Park', address: '2200 Lee Rd, Winter Park, FL 32789', miles: '5.2 miles away', hours: 'Open now', earliest: '11:00am', image: '/api/media/file/lab-winter-park-building.jpg', map: '/img/locations/winter-park-map.png', mapPos: '90% 50%', viewHref: '#', bookHref: '/book-a-consultation' },
  { name: 'Monterey', address: '5 Harris Ct Bldg. T, Suite 102, Monterey, CA 93940', miles: '3,010 miles away', hours: 'Open now', earliest: '11:00am', image: '/api/media/file/lab-monterey.jpg', map: '/img/locations/monterey-map.png', mapPos: '92% 50%', viewHref: '#', bookHref: '/book-a-consultation' },
]

// Known locations keyed by name, so CMS-driven blocks that omit map/image data
// still get the shipped assets the home page uses.
const DEFAULT_BY_NAME: Record<string, LocationItem> = DEFAULTS.reduce(
  (acc, d) => ({ ...acc, [d.name.toLowerCase()]: d }),
  {} as Record<string, LocationItem>,
)

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
  // Merge each item over its known default (by name) so a CMS location missing
  // map/image/mapPos falls back to the shipped asset instead of a blank panel —
  // this is why the home page renders the map but /neuro-labs (CMS data) did not.
  const locs = (items && items.length ? items : DEFAULTS).map((l) => {
    const d = DEFAULT_BY_NAME[(l.name || '').toLowerCase()]
    return d ? { ...l, map: l.map || d.map, mapPos: l.mapPos || d.mapPos, image: l.image || d.image, viewHref: l.viewHref || d.viewHref, bookHref: l.bookHref || d.bookHref } : l
  })
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
          <div className="loc2-list" role="group" aria-label="NESTRE locations">
            {locs.map((l, i) => {
              const on = i === active
              const initials = l.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
              return (
                // Selecting a card just moves the map focus — a convenience layer over
                // the real actions (the two links). Click selects with the mouse;
                // focusing either link inside selects it for keyboard users. No
                // role="option"/tabindex so the card doesn't nest interactives.
                <div
                  key={i}
                  className={`loc2-card${on ? ' on' : ''}`}
                  aria-current={on ? 'true' : undefined}
                  onClick={() => setActive(i)}
                  onFocusCapture={() => setActive(i)}
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
                      <a
                        className="btn outline"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.name} NESTRE ${l.address || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >View Location</a>
                      <a
                        className="btn solid"
                        href={l.bookHref || '/book-a-consultation'}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                          e.preventDefault(); e.stopPropagation()
                          window.dispatchEvent(new CustomEvent('nestre:open-consult'))
                        }}
                      >Book Training</a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* real map per location — crossfades + slow zoom on selection */}
          <div className="loc2-map">
            {locs.map((l, i) => (
              <div
                key={i}
                className={`loc2-mapimg${i === active ? ' on' : ''}`}
                style={l.map ? { backgroundImage: `url(${l.map})`, backgroundPosition: l.mapPos || 'center' } : undefined}
                aria-hidden
              />
            ))}
            <span className="loc2-map-veil" aria-hidden />
            <span className="loc2-map-name" aria-live="polite">{current.name}</span>
            <a
              className="loc2-map-open"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${current.name} NESTRE ${current.address || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
