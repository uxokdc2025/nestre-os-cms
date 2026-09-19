'use client'

/**
 * OurStoryV3 — one continuous scrollytelling sequence for Our Story.
 *
 * Native vertical scroll is the master timeline (no wheel hijack). A single tall
 * section + one sticky 100vh stage; scroll progress (0→1) drives everything:
 *   founder intro parallax → ghost line reveal → right paragraph "catch-up" rise
 *   → both columns travel up → leadership reveals → leadership PINS, one scroll
 *   state per leader (active person + synced Mindset Profile + bio) → release.
 * Continuous motion is written straight to the DOM in a rAF loop (no per-frame
 * React state); only the active leader index and the tweened ring values use
 * state. Fully bidirectional and derived from scroll. Honors reduced motion.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MindsetRingCard } from './MindsetRingCard'
import { LEADERS, initialsOf } from '@/lib/leadership'
import type { MindsetValues } from '@/lib/mindset-personas'
import styles from './OurStoryV3.module.css'

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// remap p from [a,b] → [0,1]
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// left story split into phrases for the ghost → solid reveal
const STORY = [
  'After years of impact during his football career, ',
  'Tommy faced significant cognitive and mental-performance challenges. ',
  'He was told to expect his cognitive future to be fixed, ',
  'with little room to change.',
]

// experience length + phase boundaries (fractions of scroll progress)
const TOTAL_VH = 900
const FOUNDER_END = 0.34 // founder story fully assembled by here
const LEAD_START = 0.36 // leadership begins entering (slight overlap)
const LEAD_ACTIVE_A = 0.44 // first leader active
const LEAD_ACTIVE_B = 0.98 // last leader settled

export function OurStoryV3() {
  const rootRef = useRef<HTMLElement | null>(null)
  const introRef = useRef<HTMLDivElement | null>(null)
  const founderRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leadRef = useRef<HTMLDivElement | null>(null)
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([])
  const raf = useRef<number | null>(null)
  const reduced = useRef(false)

  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  // ring values tween toward the active leader's profile (smooth morph)
  const [vals, setVals] = useState<MindsetValues>(LEADERS[0].profile)
  const valsRef = useRef<MindsetValues>(LEADERS[0].profile)
  const tweenRaf = useRef<number | null>(null)
  useEffect(() => {
    if (reduced.current) {
      setVals(LEADERS[active].profile)
      return
    }
    const from = { ...valsRef.current }
    const to = LEADERS[active].profile
    const t0 = performance.now()
    const DUR = 480
    const tick = (now: number) => {
      const e = easeInOut(clamp((now - t0) / DUR))
      const next = {
        cerebral: lerp(from.cerebral, to.cerebral, e),
        alpha: lerp(from.alpha, to.alpha, e),
        prime: lerp(from.prime, to.prime, e),
      }
      valsRef.current = next
      setVals(next)
      if (e < 1) tweenRaf.current = requestAnimationFrame(tick)
    }
    tweenRaf.current = requestAnimationFrame(tick)
    return () => {
      if (tweenRaf.current) cancelAnimationFrame(tweenRaf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = rootRef.current
    if (!root) return

    const apply = () => {
      raf.current = null
      const vh = window.innerHeight
      const rect = root.getBoundingClientRect()
      const scrollable = root.offsetHeight - vh
      const p = scrollable > 0 ? clamp(-rect.top / scrollable) : 0

      if (reduced.current) {
        // static resting state: everything visible, no transforms
        phraseRefs.current.forEach((el) => el && (el.style.opacity = '1'))
        if (introRef.current) introRef.current.style.transform = 'none'
        if (rightRef.current) { rightRef.current.style.opacity = '1'; rightRef.current.style.transform = 'none' }
        if (founderRef.current) { founderRef.current.style.opacity = '1'; founderRef.current.style.transform = 'none' }
        if (leadRef.current) { leadRef.current.style.opacity = '1'; leadRef.current.style.transform = 'none' }
      } else {
        // 1) founder intro parallax — drifts up slightly slower than the stage
        if (introRef.current) introRef.current.style.transform = `translate3d(0, ${lerp(0, -40, span(p, 0, FOUNDER_END))}px, 0)`

        // 2) ghost → solid reveal, phrase by phrase (overlapping windows)
        const N = STORY.length
        phraseRefs.current.forEach((el, i) => {
          if (!el) return
          const start = 0.05 + i * (0.20 / N)
          const t = span(p, start, start + 0.14)
          el.style.opacity = String(lerp(0.12, 1, t))
          el.style.transform = `translate3d(0, ${lerp(10, 0, t)}px, 0)`
        })

        // 3) right paragraph holds, then rises to "catch up" once left is ~80% done
        if (rightRef.current) {
          const t = span(p, 0.24, 0.34)
          rightRef.current.style.opacity = String(t)
          rightRef.current.style.transform = `translate3d(0, ${lerp(110, 0, t)}px, 0)`
        }

        // 4) founder story travels up + fades; leadership rises in underneath (overlap)
        if (founderRef.current) {
          const out = span(p, FOUNDER_END, LEAD_START + 0.06)
          founderRef.current.style.transform = `translate3d(0, ${lerp(0, -110, out)}px, 0)`
          founderRef.current.style.opacity = String(1 - out)
          founderRef.current.style.pointerEvents = out > 0.5 ? 'none' : 'auto'
        }
        if (leadRef.current) {
          const inn = span(p, LEAD_START, LEAD_START + 0.09)
          leadRef.current.style.transform = `translate3d(0, ${lerp(120, 0, inn)}px, 0)`
          leadRef.current.style.opacity = String(inn)
          leadRef.current.style.pointerEvents = inn > 0.5 ? 'auto' : 'none'
        }
      }

      // 5) active leader from scroll (works both directions)
      const la = reduced.current ? 0 : span(p, LEAD_ACTIVE_A, LEAD_ACTIVE_B)
      const idx = clamp(Math.floor(la * LEADERS.length), 0, LEADERS.length - 1)
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
    }
    const onScroll = () => {
      if (raf.current == null) raf.current = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  const goTo = (i: number) => {
    const root = rootRef.current
    if (!root) return
    const top = root.getBoundingClientRect().top + window.scrollY
    const scrollable = root.offsetHeight - window.innerHeight
    const p = lerp(LEAD_ACTIVE_A, LEAD_ACTIVE_B, (i + 0.5) / LEADERS.length)
    window.scrollTo({ top: top + p * scrollable, behavior: 'smooth' })
  }

  const member = LEADERS[active]
  const dots = useMemo(() => LEADERS.map((l) => l.id), [])

  return (
    <section ref={rootRef} className={styles.root} style={{ height: `${TOTAL_VH}vh` }} aria-label="Our story">
      <div className={styles.sticky}>
        {/* ── Founder story stage ─────────────────────────────────────────── */}
        <div ref={founderRef} className={styles.founder}>
          <div className="wrap">
            <div ref={introRef} className={styles.intro}>
              <p className={styles.introEyebrow}>This is personal.</p>
              <h2 className={styles.introH}>
                NESTRE began with founder,<br />Dr. Tommy Shavers.
              </h2>
            </div>
            <div className={styles.storyCols}>
              <p className={styles.storyLead}>
                {STORY.map((s, i) => (
                  <span
                    key={i}
                    ref={(el) => { phraseRefs.current[i] = el }}
                    className={styles.phrase}
                  >
                    {s}
                  </span>
                ))}
              </p>
              <div ref={rightRef} className={styles.storyRight}>
                <p>
                  With a belief in neuroplasticity — the brain’s ability to learn, adapt, and grow —
                  Tommy set out to prove that cognitive performance can be trained. NESTRE is the
                  result: a way to measure your mind, then strengthen it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Leadership scrollytelling stage ─────────────────────────────── */}
        <div ref={leadRef} className={styles.lead}>
          <div className="wrap">
            <p className={`eyebrow ${styles.leadEyebrow}`}>Your NESTRE Mindset Team</p>
            <h2 className={`h2 ${styles.leadH}`}>World-class leadership.</h2>

            <div className={styles.leadStage}>
              {/* left: mindset profile + bio (synced to active) */}
              <div className={styles.leadLeft}>
                <MindsetRingCard values={vals} className={styles.leadRing} />
                <div key={active} className={styles.bio}>
                  <div className={styles.bioName}>{member.name}</div>
                  <div className={styles.bioTitle}>{member.title}</div>
                  <p className={styles.bioText}>{member.bio}</p>
                </div>
              </div>

              {/* right: team nav with active/inactive emphasis */}
              <div className={styles.leadRight} role="tablist" aria-label="Leadership">
                {LEADERS.map((l, i) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`${styles.person} ${i === active ? styles.personOn : ''}`}
                    aria-current={i === active ? 'true' : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span className={styles.pAva}>
                      {l.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.image} alt="" loading="lazy" />
                      ) : (
                        <span>{initialsOf(l.name)}</span>
                      )}
                    </span>
                    <span className={styles.pMeta}>
                      <span className={styles.pName}>{l.name}</span>
                      <span className={styles.pTitle}>{l.title}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* vertical progress dots (far left) */}
          <div className={styles.progress} aria-hidden="true">
            {dots.map((id, i) => (
              <b key={id} className={`${styles.pDot} ${i === active ? styles.pDotOn : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurStoryV3
