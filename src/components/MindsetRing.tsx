'use client'

/**
 * MindsetRing (V2) — scroll-driven "NESTRE Mindset Profile" section, card-pair layout.
 *
 * A tall pinned section. Centered heading on top; below it a side-by-side PAIR:
 * a persona card (portrait + type chip + first-person quote + name + role) on the
 * left, and a "NESTRE Mindset Profile" ring card on the right. As the reader scrolls,
 * the active persona advances (Baseline → Executive → Athlete → Deep-Thinker):
 * the persona card cross-fades (blur + slide), the ring re-tweens its three neon
 * arcs (Cerebral / Alpha / Prime) and the percentages recount, and the ambient
 * glow shifts to the persona's accent. Progress dots track position. Honors
 * prefers-reduced-motion (static Executive). All styling lives in the co-located
 * CSS module. Design/interaction match the approved source V2.
 */

import React, { useEffect, useRef, useState } from 'react'
import { SEQUENCE as DEFAULT_SEQUENCE, type Persona, type MindsetValues } from '@/lib/mindset-personas'
import { MindsetRingCard } from './MindsetRingCard'
import styles from './MindsetRing.module.css'

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type Props = {
  eyebrow?: string
  heading?: string
  sequence?: Persona[]
}

export function MindsetRing({
  eyebrow = 'Your NESTRE Mindset Profile',
  heading = 'No two minds read the same.',
  sequence = DEFAULT_SEQUENCE,
}: Props) {
  const steps = sequence.length
  const [active, setActive] = useState(0)
  const [vals, setVals] = useState<MindsetValues>(sequence[0].values)
  const [reduced, setReduced] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const rafScroll = useRef<number | null>(null)
  const rafTween = useRef<number | null>(null)

  // prefers-reduced-motion → static representative persona (Executive when present)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (mq.matches) {
        const idx = Math.min(1, steps - 1)
        setReduced(true)
        setActive(idx)
        setVals(sequence[idx].values)
      } else {
        setReduced(false)
      }
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [sequence, steps])

  // scroll → active persona (one band per persona while pinned)
  useEffect(() => {
    if (reduced) return
    const onScroll = () => {
      if (rafScroll.current != null) return
      rafScroll.current = requestAnimationFrame(() => {
        rafScroll.current = null
        const el = sectionRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const scrollable = rect.height - window.innerHeight
        if (scrollable <= 0) return
        const progress = clamp(-rect.top / scrollable, 0, 1)
        const idx = clamp(Math.round(progress * (steps - 1)), 0, steps - 1)
        setActive((prev) => (prev === idx ? prev : idx))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafScroll.current != null) cancelAnimationFrame(rafScroll.current)
    }
  }, [reduced, steps])

  // tween ring values on persona change
  useEffect(() => {
    const target = sequence[active].values
    if (reduced) {
      setVals(target)
      return
    }
    const from = { ...vals }
    const start = performance.now()
    const DUR = 700
    const tick = (now: number) => {
      const t = clamp((now - start) / DUR, 0, 1)
      const e = easeInOut(t)
      setVals({
        cerebral: lerp(from.cerebral, target.cerebral, e),
        alpha: lerp(from.alpha, target.alpha, e),
        prime: lerp(from.prime, target.prime, e),
      })
      if (t < 1) rafTween.current = requestAnimationFrame(tick)
    }
    rafTween.current = requestAnimationFrame(tick)
    return () => {
      if (rafTween.current != null) cancelAnimationFrame(rafTween.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, sequence])

  // whole-number percentages that sum to 100 (for the aria label)
  const total = vals.cerebral + vals.alpha + vals.prime || 1
  const cerPct = Math.round((vals.cerebral / total) * 100)
  const alpPct = Math.round((vals.alpha / total) * 100)
  const priPct = 100 - cerPct - alpPct

  const persona = sequence[active]
  const ariaLabel = `Mindset profile: ${cerPct}% Cerebral, ${alpPct}% Alpha, ${priPct}% Prime — ${persona.label}`

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="mindset-ring-heading">
      <div className={styles.sticky}>
        <div className={styles.ambient} style={{ ['--glow' as string]: persona.accent } as React.CSSProperties} />

        <div className={styles.head}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="mindset-ring-heading" className={styles.heading}>
            {heading}
          </h2>
        </div>

        <div className={styles.pair}>
          {/* persona card (cross-fades) */}
          <div className={styles.pslot}>
            {sequence.map((p, i) => {
              const cls =
                i === active
                  ? `${styles.persona} ${styles.personaActive}`
                  : i < active
                    ? `${styles.persona} ${styles.personaPast}`
                    : styles.persona
              return (
                <div key={p.key} className={cls} aria-hidden={i === active ? undefined : true}>
                  <div className={styles.pcard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={i === active ? p.imageAlt : ''}
                      loading="lazy"
                      style={p.imagePos ? { objectPosition: p.imagePos } : undefined}
                    />
                    <div className={styles.pgrad} />
                    <div className={styles.pov}>
                      <p className={styles.pquote}>{p.quote}</p>
                      <div className={styles.pname}>{p.name}</div>
                      <div className={styles.prole}>{p.role}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ring card (shared component, fed the tweened values) */}
          <MindsetRingCard values={vals} ariaLabel={ariaLabel} className={styles.mcardApp} />
        </div>

        {!reduced && (
          <div className={styles.prog} aria-hidden="true">
            {sequence.map((p, i) => (
              <b key={p.key} className={`${styles.progDot} ${i === active ? styles.progOn : ''}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default MindsetRing
