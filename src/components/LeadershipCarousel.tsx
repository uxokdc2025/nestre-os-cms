'use client'

/**
 * LeadershipCarousel — "Your NESTRE Mindset Team" section for Our Story v2.
 *
 * A horizontal, snap-scrolling carousel of leadership cards. Each card reuses the
 * shared <MindsetRingCard/> (so the ring is identical to the rest of the site) with
 * a custom header: the person's photo (or a branded initials avatar when we don't
 * have one yet) + name + title. Prev/next arrows and progress dots.
 *
 * NOTE: the mindset `values` below are PLACEHOLDERS until NESTRE supplies each
 * leader's real Cerebral/Alpha/Prime split. Real photos: Goldberg only so far.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { MindsetValues } from '@/lib/mindset-personas'
import { MindsetRingCard } from './MindsetRingCard'

type Leader = {
  name: string
  title: string
  photo?: string
  values: MindsetValues // placeholder until real profiles arrive
}

const LEADERS: Leader[] = [
  { name: 'Dr. Elkhonon Goldberg', title: 'Chief Scientific Officer', photo: '/app-v2/leaders/goldberg.jpg', values: { cerebral: 50, alpha: 21, prime: 29 } },
  { name: 'Daniel Dorosz', title: 'Chief Technology Officer', values: { cerebral: 44, alpha: 26, prime: 30 } },
  { name: 'Carlos Perez', title: 'Chief Operating Officer', values: { cerebral: 30, alpha: 40, prime: 30 } },
  { name: 'Clayton Buckaloo', title: 'Chief Growth Officer', values: { cerebral: 28, alpha: 44, prime: 28 } },
  { name: 'Tomica Nelson-Shavers', title: 'President', values: { cerebral: 34, alpha: 40, prime: 26 } },
]

const initials = (name: string) =>
  name
    .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

function LeaderHead({ leader }: { leader: Leader }) {
  return (
    <div className="leader-head">
      <div className="leader-ava" aria-hidden={leader.photo ? undefined : true}>
        {leader.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={leader.photo} alt={leader.name} loading="lazy" />
        ) : (
          <span>{initials(leader.name)}</span>
        )}
      </div>
      <div className="leader-meta">
        <div className="leader-name">{leader.name}</div>
        <div className="leader-title">{leader.title}</div>
      </div>
    </div>
  )
}

export function LeadershipCarousel() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  // track which card is centered for the dots
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const slides = Array.from(el.querySelectorAll<HTMLElement>('.leader-slide'))
        const mid = el.scrollLeft + el.clientWidth / 2
        let best = 0
        let bestD = Infinity
        slides.forEach((s, i) => {
          const c = s.offsetLeft + s.offsetWidth / 2
          const d = Math.abs(c - mid)
          if (d < bestD) {
            bestD = d
            best = i
          }
        })
        setActive(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const scrollTo = useCallback((i: number) => {
    const el = trackRef.current
    if (!el) return
    const slide = el.querySelectorAll<HTMLElement>('.leader-slide')[i]
    if (slide) el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2, behavior: 'smooth' })
  }, [])

  const step = (dir: number) => scrollTo(Math.max(0, Math.min(LEADERS.length - 1, active + dir)))

  return (
    <section className="sec navy leaders-sec" aria-labelledby="leaders-heading">
      <div className="wrap">
        <p className="eyebrow" style={{ textAlign: 'center' }}>Your NESTRE Mindset Team</p>
        <h2 id="leaders-heading" className="h2" style={{ textAlign: 'center', marginTop: 12 }}>
          World-class leadership.
        </h2>

        <div className="leaders-viewport">
          <button className="leaders-arrow prev" aria-label="Previous" onClick={() => step(-1)} disabled={active === 0}>
            ‹
          </button>
          <div className="leaders-track" ref={trackRef}>
            {LEADERS.map((l) => (
              <div className="leader-slide" key={l.name}>
                <MindsetRingCard
                  values={l.values}
                  header={<LeaderHead leader={l} />}
                  ariaLabel={`${l.name}, ${l.title} — NESTRE Mindset Profile`}
                  className="leader-ringcard"
                  animateIn
                />
              </div>
            ))}
          </div>
          <button
            className="leaders-arrow next"
            aria-label="Next"
            onClick={() => step(1)}
            disabled={active === LEADERS.length - 1}
          >
            ›
          </button>
        </div>

        <div className="leaders-dots" role="tablist" aria-label="Leaders">
          {LEADERS.map((l, i) => (
            <button
              key={l.name}
              className={`leaders-dot ${i === active ? 'on' : ''}`}
              aria-label={l.name}
              aria-selected={i === active}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LeadershipCarousel
