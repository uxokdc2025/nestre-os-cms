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
import {
  SEQUENCE as DEFAULT_SEQUENCE,
  DIMENSIONS,
  type Persona,
  type MindsetValues,
} from '@/lib/mindset-personas'
import styles from './MindsetRing.module.css'

// ── Ring geometry (source V2) ────────────────────────────────────────────────
const CX = 180
const CY = 188
const R = 118
const LBLR = 150
const GAP = 5

const color = (k: keyof MindsetValues) => DIMENSIONS.find((d) => d.key === k)!.color
// muted label-name tints, matched to the source
const NAME_TINT: Record<keyof MindsetValues, string> = {
  cerebral: '#d59ce0',
  alpha: '#8fe3b0',
  prime: '#96daf0',
}
// draw order + fixed label angles (deg, clockwise from 12 o'clock)
const SEG: { key: keyof MindsetValues; name: string; deg: number }[] = [
  { key: 'alpha', name: 'ALPHA', deg: 90 },
  { key: 'prime', name: 'PRIME', deg: 180 },
  { key: 'cerebral', name: 'CEREBRAL', deg: 270 },
]

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

const polar = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}
const arcPath = (r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(r, a0)
  const [x1, y1] = polar(r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

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

  // whole-number percentages that sum to 100
  const total = vals.cerebral + vals.alpha + vals.prime || 1
  const cerPct = Math.round((vals.cerebral / total) * 100)
  const alpPct = Math.round((vals.alpha / total) * 100)
  const priPct = 100 - cerPct - alpPct
  const pct: Record<keyof MindsetValues, number> = { cerebral: cerPct, alpha: alpPct, prime: priPct }

  // build arcs sequentially (source math): sweeps proportional, small gaps
  const avail = 360 - SEG.length * GAP
  let a = 0
  const arcs = SEG.map((s) => {
    const sweep = (vals[s.key] / total) * avail
    const startDeg = a + GAP / 2
    const endDeg = startDeg + sweep
    a = endDeg + GAP / 2
    const [dx, dy] = polar(R, startDeg)
    return { ...s, d: arcPath(R, startDeg, Math.max(startDeg + 0.001, endDeg)), dot: { x: dx, y: dy } }
  })

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
                    <span className={styles.ptype}>{p.label}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={i === active ? p.imageAlt : ''} loading="lazy" />
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

          {/* ring card */}
          <div className={styles.mcard}>
            <div className={styles.mcardTitle}>NESTRE Mindset Profile</div>
            <div className={styles.mcardRule} />
            <div className={styles.ringbox}>
              <svg
                className={styles.ring}
                viewBox="0 0 360 400"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={ariaLabel}
              >
                <circle className={styles.track} cx={CX} cy={CY} r={R} />
                {arcs.map((arc) => (
                  <path
                    key={`arc-${arc.key}`}
                    className={styles.arc}
                    d={arc.d}
                    stroke={color(arc.key)}
                    style={{ filter: `drop-shadow(0 0 12px ${color(arc.key)}d9)` }}
                  />
                ))}
                {arcs.map((arc) => (
                  <circle
                    key={`dot-${arc.key}`}
                    className={styles.dot}
                    cx={arc.dot.x}
                    cy={arc.dot.y}
                    r={5}
                    fill={color(arc.key)}
                    style={{ filter: `drop-shadow(0 0 8px ${color(arc.key)})` }}
                  />
                ))}
                {SEG.map((s) => {
                  const [lx, ly] = polar(LBLR, s.deg)
                  const anchor = s.deg === 90 ? 'start' : s.deg === 270 ? 'end' : 'middle'
                  return (
                    <g key={`lbl-${s.key}`}>
                      <text
                        className={styles.lblVal}
                        x={lx}
                        y={s.deg === 180 ? ly + 6 : ly - 2}
                        textAnchor={anchor}
                        fill={color(s.key)}
                      >
                        {pct[s.key]}%
                      </text>
                      <text
                        className={styles.lblName}
                        x={lx}
                        y={s.deg === 180 ? ly + 22 : ly + 14}
                        textAnchor={anchor}
                        fill={NAME_TINT[s.key]}
                      >
                        {s.name}
                      </text>
                    </g>
                  )
                })}
                {/* NESTRE "N" monogram */}
                <g transform={`translate(${CX},${CY})`}>
                  <path className={styles.nmark} d="M -25 32 L -25 -32 L 25 32 L 25 -32" />
                  <circle className={styles.nmarkDot} cx={-25} cy={-32} r={4.2} />
                  <circle className={styles.nmarkDot} cx={25} cy={32} r={4.2} />
                  <circle className={styles.nmarkDot} cx={25} cy={-32} r={4.2} />
                  <circle className={styles.nmarkDot} cx={-25} cy={8} r={3.3} />
                  <circle className={styles.nmarkDot} cx={4} cy={-2} r={3} />
                </g>
              </svg>
            </div>
          </div>
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
