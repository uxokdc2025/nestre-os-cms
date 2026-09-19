'use client'

/**
 * OurStoryV4 — same continuous scrollytelling as V3, but the leadership stage
 * reworked per the V4 brief:
 *   • LEFT column = the Mindset Profile ring ONLY. It stays vertically static and
 *     just morphs to the active leader's profile (bio removed from the left).
 *   • RIGHT column = the name list. As scroll advances the list travels upward so
 *     the active name stays anchored (centered) in the nav viewport; the active
 *     name reveals its title AND description floating directly underneath it
 *     (accordion-style), pushing the following names down.
 * Founder→leadership handoff, motion model and reduced-motion handling are
 * unchanged from V3 (opaque transform travel, native scroll + rAF).
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MindsetRingCard } from './MindsetRingCard'
import { LEADERS, initialsOf } from '@/lib/leadership'
import type { MindsetValues } from '@/lib/mindset-personas'
import styles from './OurStoryV4.module.css'

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
const FOUNDER_END = 0.18 // founder story fully assembled by here (fast reveal)
const LEAD_START = 0.2 // leadership begins entering (slight overlap)
const LEAD_ACTIVE_A = 0.28 // first leader active
const LEAD_ACTIVE_B = 0.98 // last leader settled

export function OurStoryV4() {
  const rootRef = useRef<HTMLElement | null>(null)
  const introRef = useRef<HTMLDivElement | null>(null)
  const founderRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leadRef = useRef<HTMLDivElement | null>(null)
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([])
  const raf = useRef<number | null>(null)
  const reduced = useRef(false)

  // nav-travel refs
  const navRef = useRef<HTMLDivElement | null>(null)
  const navInnerRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([])

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

  // travel the name list so the active row stays centered in the nav viewport.
  // Re-runs on active change, and a ResizeObserver keeps it synced while the
  // active row's description accordions open/closed (its height changes).
  const positionNav = React.useCallback(() => {
    const nav = navRef.current
    const inner = navInnerRef.current
    const row = rowRefs.current[activeRef.current]
    if (!nav || !inner || !row) return
    const ty = nav.clientHeight / 2 - (row.offsetTop + row.offsetHeight / 2)
    inner.style.transform = `translate3d(0, ${ty}px, 0)`
  }, [])

  useLayoutEffect(() => {
    positionNav()
  }, [active, positionNav])

  useEffect(() => {
    const inner = navInnerRef.current
    if (!inner || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => positionNav())
    ro.observe(inner)
    return () => ro.disconnect()
  }, [positionNav])

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

      // ── within-founder reveals (skip the staggered ghost under reduced motion) ──
      if (introRef.current)
        introRef.current.style.transform = reduced.current
          ? 'none'
          : `translate3d(0, ${lerp(0, -40, span(p, 0, FOUNDER_END))}px, 0)`

      // ghost → solid reveal, phrase by phrase (overlapping windows)
      const N = STORY.length
      phraseRefs.current.forEach((el, i) => {
        if (!el) return
        if (reduced.current) { el.style.opacity = '1'; el.style.transform = 'none'; return }
        const start = 0.02 + i * (0.10 / N)
        const t = span(p, start, start + 0.07)
        el.style.opacity = String(lerp(0.12, 1, t))
        el.style.transform = `translate3d(0, ${lerp(10, 0, t)}px, 0)`
      })

      // right paragraph holds, then rises to "catch up" once left is ~80% done
      if (rightRef.current) {
        if (reduced.current) { rightRef.current.style.opacity = '1'; rightRef.current.style.transform = 'none' }
        else {
          const t = span(p, 0.11, 0.18)
          rightRef.current.style.opacity = String(t)
          rightRef.current.style.transform = `translate3d(0, ${lerp(110, 0, t)}px, 0)`
        }
      }

      // ── section handoff: founder SLIDES UP and out, revealing the opaque
      //    leadership stage sitting beneath it (transform travel, no cross-fade). ──
      if (founderRef.current) {
        const out = span(p, FOUNDER_END, LEAD_START + 0.08)
        founderRef.current.style.transform = `translate3d(0, ${lerp(0, -100, out)}vh, 0)`
        founderRef.current.style.pointerEvents = out > 0.5 ? 'none' : 'auto'
      }
      if (leadRef.current) {
        const revealed = p >= FOUNDER_END
        leadRef.current.style.pointerEvents = revealed ? 'auto' : 'none'
      }

      // active leader from scroll (works both directions)
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

  const dots = useMemo(() => LEADERS.map((l) => l.id), [])

  return (
    <section ref={rootRef} className={styles.root} style={{ height: `${TOTAL_VH}vh` }} aria-label="Our story">
      <div className={styles.sticky}>
        {/* ── Founder story stage (paper) ─────────────────────────────────── */}
        <div ref={founderRef} className={styles.founder}>
          <div className="wrap">
            <div className={styles.storyCols}>
              <div className={styles.storyLeft}>
                <div ref={introRef} className={styles.intro}>
                  <p className={styles.introEyebrow}>This is personal.</p>
                  <h2 className={styles.introH}>
                    NESTRE began with founder,<br />Dr. Tommy Shavers.
                  </h2>
                </div>
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
              </div>
              <div ref={rightRef} className={styles.storyRight}>
                <p>
                  With a belief in neuroplasticity and the power of the mind, he developed language and
                  a system to measure cognitive performance and make the data actionable. His experience
                  exposed how performance can be affected by factors we can’t see through the body alone —
                  and that insight became a broader mission: help every person understand their mind and
                  brain performance, unlock more of what they’re capable of, and meet increasing demands
                  with greater clarity, capacity and resilience using the power of neuroscience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Leadership scrollytelling stage ─────────────────────────────── */}
        <div ref={leadRef} className={styles.lead}>
          <div className="wrap">
            <div className={styles.leadStage}>
              {/* left: mindset profile ring only — static position, morphs to active */}
              <div className={styles.leadLeft}>
                <MindsetRingCard values={vals} className={styles.leadRing} />
              </div>

              {/* right: heading + travelling name list; active reveals title +
                  description floating underneath the name */}
              <div className={styles.leadRight}>
                <div className={styles.leadHead}>
                  <p className="eyebrow">Your NESTRE Mindset Team</p>
                  <h2 className="h2">World-class leadership.</h2>
                </div>
                <div ref={navRef} className={styles.leadNav}>
                  <div ref={navInnerRef} className={styles.leadNavInner} role="tablist" aria-label="Leadership">
                    {LEADERS.map((l, i) => (
                      <button
                        key={l.id}
                        type="button"
                        ref={(el) => { rowRefs.current[i] = el }}
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
                          <span className={styles.pDesc}>
                            <span className={styles.pDescInner}>{l.bio}</span>
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
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

export default OurStoryV4
