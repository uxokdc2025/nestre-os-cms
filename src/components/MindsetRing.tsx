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
const GAP = 12 // dark gap at each node — segments fade out to black at both ends

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

// Each arc = a SOLID full-colour middle plus a short gradient tail at each end that
// fades to black over a FIXED number of degrees. The middle is one smooth path (no
// stepping) and stays full colour on big/extreme arcs; the tails are short enough
// (≤ FADE_DEG) that a plain chord-linear gradient reads as a smooth curve fade.
const FADE_DEG = 26

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
    const stop = Math.max(startDeg + 0.001, endDeg)
    const span = stop - startDeg
    const fade = Math.min(FADE_DEG, span / 2)
    const midStart = startDeg + fade
    const midStop = stop - fade
    const [dx, dy] = polar(R, startDeg)
    const [tax, tay] = polar(R, startDeg) // tail A outer (fades to black)
    const [taix, taiy] = polar(R, midStart) // tail A inner (full colour)
    const [tbix, tbiy] = polar(R, midStop) // tail B inner (full colour)
    const [tbx, tby] = polar(R, stop) // tail B outer (fades to black)
    return {
      ...s,
      start: startDeg,
      stop,
      midStart,
      midStop,
      hasMid: midStop - midStart > 0.4,
      tailA: { d: arcPath(R, startDeg, midStart), x1: tax, y1: tay, x2: taix, y2: taiy },
      tailB: { d: arcPath(R, midStop, stop), x1: tbix, y1: tbiy, x2: tbx, y2: tby },
      dot: { x: dx, y: dy },
      self: color(s.key),
    }
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

          {/* ring card */}
          <div className={styles.mcard}>
            <div className={styles.mcardTitle}>NESTRE Mindset Profile</div>
            <div className={styles.ringbox}>
              <svg
                className={styles.ring}
                viewBox="0 46 360 286"
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={ariaLabel}
              >
                <defs>
                  {arcs.map((arc) => (
                    <React.Fragment key={`grad-${arc.key}`}>
                      <linearGradient
                        id={`mr-ta-${arc.key}`}
                        gradientUnits="userSpaceOnUse"
                        x1={arc.tailA.x1}
                        y1={arc.tailA.y1}
                        x2={arc.tailA.x2}
                        y2={arc.tailA.y2}
                      >
                        <stop offset="0%" stopColor={arc.self} stopOpacity="0" />
                        <stop offset="100%" stopColor={arc.self} stopOpacity="1" />
                      </linearGradient>
                      <linearGradient
                        id={`mr-tb-${arc.key}`}
                        gradientUnits="userSpaceOnUse"
                        x1={arc.tailB.x1}
                        y1={arc.tailB.y1}
                        x2={arc.tailB.x2}
                        y2={arc.tailB.y2}
                      >
                        <stop offset="0%" stopColor={arc.self} stopOpacity="1" />
                        <stop offset="100%" stopColor={arc.self} stopOpacity="0" />
                      </linearGradient>
                    </React.Fragment>
                  ))}
                </defs>
                <circle className={styles.track} cx={CX} cy={CY} r={R} />
                {arcs.map((arc) => (
                  <g key={`arc-${arc.key}`} style={{ filter: `drop-shadow(0 0 5px ${arc.self}80)` }}>
                    {arc.hasMid && (
                      <path
                        className={styles.arc}
                        d={arcPath(R, arc.midStart, arc.midStop)}
                        stroke={arc.self}
                      />
                    )}
                    <path className={styles.arc} d={arc.tailA.d} stroke={`url(#mr-ta-${arc.key})`} />
                    <path className={styles.arc} d={arc.tailB.d} stroke={`url(#mr-tb-${arc.key})`} />
                  </g>
                ))}
                {arcs.map((arc) => (
                  <circle
                    key={`dot-${arc.key}`}
                    className={styles.dot}
                    cx={arc.dot.x - 2}
                    cy={arc.dot.y}
                    r={13.5}
                    fill="#0b1016"
                    stroke={color(arc.key)}
                  />
                ))}
                {/* NESTRE brand mark (from white-n.svg, viewBox 1000×1000; centred on the ring) */}
                <g className={styles.nlogo} transform={`translate(${CX},${CY}) scale(0.086) translate(-496,-480)`}>
                  <path d="M861.78,146.37c-1.74-24.56-21.68-44.5-46.24-46.24-19.38-1.37-36.62,8.31-46.05,23.37-2.64,4.22-7.29,6.76-12.28,6.76h-29.61s-39.5,0-39.5,0v304.73c0,4.98-2.54,9.63-6.76,12.28-15.06,9.44-24.75,26.67-23.37,46.05,1.75,24.72,21.93,44.72,46.66,46.27,29.09,1.83,53.24-21.22,53.24-49.91,0-17.94-9.44-33.66-23.63-42.49-4.19-2.61-6.64-7.27-6.64-12.2V169.77s29.61,0,29.61,0c4.94,0,9.6,2.47,12.22,6.66,4.05,6.51,9.56,12.01,16.06,16.06,4.19,2.61,6.66,7.28,6.66,12.22v655.79s-64.29,0-64.29,0l-250.43-309.77c-3.18-3.93-4.15-9.26-2.39-14,2.2-5.94,3.3-12.41,3.06-19.17-.94-26.03-22.32-47.33-48.36-48.15-29.64-.94-53.72,23.92-51.49,53.82,1.81,24.32,21.46,44.07,45.77,46.02,3.15.25,6.24.21,9.26-.1,4.81-.49,9.52,1.58,12.56,5.34l263.15,325.51.04-.03v.03h122.62V204.7c0-4.98,2.54-9.63,6.76-12.28,15.07-9.44,24.75-26.67,23.37-46.05Z" />
                  <path d="M273.25,117.86v31.1l-.04,29.27.04,1.47v682.54h-66.3v-171.07c0-5.07,2.64-9.79,6.98-12.41,15.36-9.28,25.34-26.59,24.09-46.12-1.59-24.86-21.84-45.08-46.71-46.63-29.07-1.81-53.22,21.23-53.22,49.92,0,18.23,9.76,34.17,24.33,42.91,4.3,2.58,6.84,7.32,6.84,12.33v208.82h37.68v-.07h103.98V226.96l346.56,434.58c3.08,3.86,4.06,9.04,2.41,13.7-2.09,5.91-3.11,12.33-2.8,19.03,1.19,25.76,22.38,46.72,48.15,47.63,29.52,1.04,53.58-23.52,51.72-53.21-1.43-22.88-18.71-42.18-41.3-46.05-4.98-.85-9.84-.94-14.5-.39-4.92.58-9.77-1.52-12.85-5.4L273.25,117.86Z" />
                  <path d="M208.71,383.12v-176.54c0-5.02,2.57-9.7,6.84-12.33,15.5-9.53,25.51-27.13,24.15-46.95-1.72-25.19-22.27-45.61-47.47-47.18-29.57-1.85-54.14,21.59-54.14,50.76,0,18.4,9.77,34.52,24.4,43.45,4.24,2.58,6.71,7.29,6.71,12.25v176.54c0,5.02-2.57,9.7-6.84,12.33-15.5,9.53-25.51,27.13-24.15,46.95,1.72,25.19,22.27,45.61,47.47,47.18,29.57,1.85,54.14-21.59,54.14-50.76,0-18.4-9.77-34.52-24.4-43.45-4.24-2.58-6.71-7.29-6.71-12.25Z" />
                </g>
              </svg>
            </div>
            <div className={styles.stats}>
              {(['cerebral', 'prime', 'alpha'] as (keyof MindsetValues)[]).map((k) => (
                <div key={k} className={styles.statCol}>
                  <div className={styles.statNum} style={{ color: color(k) }}>
                    {pct[k]}%
                  </div>
                  <div className={styles.statName} style={{ color: NAME_TINT[k] }}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </div>
                </div>
              ))}
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
