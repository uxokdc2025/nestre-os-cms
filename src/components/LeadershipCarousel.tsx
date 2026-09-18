'use client'

/**
 * LeadershipCarousel — "Your NESTRE Mindset Team" for Our Story v2.
 *
 * A PINNED, scroll-driven horizontal carousel: the section pins while vertical
 * scroll translates the row of leader cards to the right; once the row reaches its
 * end the pin releases and the page scrolls on. Each card reuses the shared
 * <MindsetRingCard/> with a custom header (photo — or a branded initials avatar —
 * + name + title). Left/right edge fade masks so cards ease in and out.
 *
 * NOTE: mindset `values` are PLACEHOLDERS until NESTRE supplies each leader's real
 * Cerebral/Alpha/Prime split. Real photo: Goldberg only so far.
 */

import React, { useEffect, useRef, useState } from 'react'
import type { MindsetValues } from '@/lib/mindset-personas'
import { MindsetRingCard } from './MindsetRingCard'

type Leader = { name: string; title: string; photo?: string; values: MindsetValues }

const LEADERS: Leader[] = [
  { name: 'Dr. Elkhonon Goldberg', title: 'Chief Scientific Officer', photo: '/app-v2/leaders/goldberg.jpg', values: { cerebral: 50, alpha: 21, prime: 29 } },
  { name: 'Daniel Dorosz', title: 'Chief Technology Officer', values: { cerebral: 44, alpha: 26, prime: 30 } },
  { name: 'Carlos Perez', title: 'Chief Operating Officer', values: { cerebral: 30, alpha: 40, prime: 30 } },
  { name: 'Clayton Buckaloo', title: 'Chief Growth Officer', values: { cerebral: 28, alpha: 44, prime: 28 } },
  { name: 'Tomica Nelson-Shavers', title: 'President', values: { cerebral: 34, alpha: 40, prime: 26 } },
]

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

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
  const sectionRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const raf = useRef<number | null>(null)
  const [maxX, setMaxX] = useState(0) // horizontal travel in px (0 = everything fits, no pin)
  const [active, setActive] = useState(0)

  // measure travel + drive the transform from vertical scroll while pinned
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!section || !track || !viewport) return

    const DWELL = 200 // extra px at the end where the last card sits fully in view before release
    let travel = 0
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - viewport.clientWidth)
      setMaxX(travel)
      section.style.height = travel > 0 ? `${window.innerHeight + travel + DWELL}px` : ''
      update()
    }
    const update = () => {
      raf.current = null
      if (travel <= 0) {
        track.style.transform = 'none'
        setActive(0)
        return
      }
      const rect = section.getBoundingClientRect()
      // scrolled px into the pin; first `travel` px move the row, last DWELL px hold it
      const scrolled = clamp(-rect.top, 0, travel)
      track.style.transform = `translate3d(${-scrolled}px,0,0)`
      setActive(clamp(Math.round((scrolled / travel) * (LEADERS.length - 1)), 0, LEADERS.length - 1))
    }
    const onScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(update)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    ro.observe(viewport)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      if (raf.current != null) cancelAnimationFrame(raf.current)
      section.style.height = ''
    }
  }, [])

  // jump to a card by scrolling the page to the matching pin position
  const goTo = (i: number) => {
    const section = sectionRef.current
    if (!section || maxX <= 0) return
    const top = section.getBoundingClientRect().top + window.scrollY
    // map the dot to its position within the travel range (dwell excluded)
    window.scrollTo({ top: top + (i / (LEADERS.length - 1)) * maxX, behavior: 'smooth' })
  }

  return (
    <section className="sec navy leaders-sec" ref={sectionRef} aria-labelledby="leaders-heading">
      <div className="leaders-sticky">
        <div className="wrap leaders-headwrap">
          <p className="eyebrow" style={{ textAlign: 'center' }}>Your NESTRE Mindset Team</p>
          <h2 id="leaders-heading" className="h2" style={{ textAlign: 'center', marginTop: 12 }}>
            World-class leadership.
          </h2>
        </div>

        <div className="leaders-viewport" ref={viewportRef}>
          <div className="leaders-track" ref={trackRef}>
            {LEADERS.map((l) => (
              <div className="leader-slide" key={l.name}>
                <MindsetRingCard
                  values={l.values}
                  header={<LeaderHead leader={l} />}
                  ariaLabel={`${l.name}, ${l.title} — NESTRE Mindset Profile`}
                  className="leader-ringcard"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="leaders-dots" role="tablist" aria-label="Leaders">
          {LEADERS.map((l, i) => (
            <button
              key={l.name}
              className={`leaders-dot ${i === active ? 'on' : ''}`}
              aria-label={l.name}
              aria-selected={i === active}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LeadershipCarousel
