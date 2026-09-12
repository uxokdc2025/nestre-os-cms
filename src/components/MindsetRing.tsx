'use client'

/**
 * MindsetRing — a self-contained, scroll-driven "Mindset Profile" ring section.
 *
 * WHAT IT IS
 * A tall (~360vh) scrollytelling section. An SVG donut ring (Cerebral / Alpha /
 * Prime) is FRONT AND CENTER and stays sticky-centered in the viewport for the
 * whole section. As the reader scrolls, the active persona advances through the
 * sequence (baseline → Executive → Athlete → Deep-Thinker). Each persona's
 * lifestyle image floats up on ALTERNATING sides (left, right, left, right),
 * edge-masked with a gradient so it dissolves into the background before it
 * reaches the ring and never overlaps it. A short on-brand one-liner rides with
 * each image. On every step the ring's center re-tweens — arcs redraw and the
 * three percentages count up to that persona's split. After the final persona,
 * the whole ring + imagery floats away (fade + drift) to reveal the next
 * section cleanly. Honors prefers-reduced-motion (static Executive, no motion).
 * All styling lives in the co-located CSS Module — it never touches the global
 * stylesheet.
 *
 * ── INTEGRATION ────────────────────────────────────────────────────────────
 * As a standalone section in any page.tsx (e.g. src/app/(frontend)/page.tsx),
 * drop it between other <section> blocks — it renders its own <section>:
 *
 *     import { MindsetRing } from '@/components/MindsetRing'
 *     // ...
 *     <MindsetRing />
 *
 * That single line is the entire integration. No props are required; the
 * component owns its scroll wiring, height (360vh), and teardown. Because it is
 * a client component, it is safe to render inside a Server Component page.
 *
 * Optional props let you retune copy/data without editing the component:
 *     <MindsetRing eyebrow="Mindset Profile" heading="Your cognitive fingerprint." />
 *     <MindsetRing sequence={CUSTOM_SEQUENCE} />   // any Persona[] (see mindset-personas.ts)
 *
 * ── BECOMING A PAYLOAD BLOCK LATER ─────────────────────────────────────────
 * To expose this in the CMS as an editable block:
 *   1. Add a block config (e.g. src/blocks/MindsetRing.ts) with fields:
 *        eyebrow (text), heading (text), and a `personas` array field whose
 *        subfields mirror the Persona type (key, label, cerebral, alpha, prime,
 *        headline, sub, quote, image (upload relationship), imageAlt).
 *   2. Register that block in the relevant collection's `blocks` array (do this
 *      in the collection file — NOT in this component).
 *   3. In the block renderer (RenderBlocks), map the block fields onto this
 *      component's props: <MindsetRing eyebrow={block.eyebrow} heading={block.heading}
 *      sequence={block.personas.map(toPersona)} /> — converting each uploaded
 *      media doc to its `/api/media/file/<filename>` URL for the `image` field.
 * The Persona shape (see '@/lib/mindset-personas') is intentionally plain so a
 * Payload block maps onto it 1:1.
 */

import { useEffect, useRef, useState } from 'react'
import {
  SEQUENCE as DEFAULT_SEQUENCE,
  ARC_ORDER,
  DIMENSIONS,
  type Persona,
  type MindsetValues,
} from '@/lib/mindset-personas'
import styles from './MindsetRing.module.css'

// ── Ring geometry ────────────────────────────────────────────────────────────
const SIZE = 360
const CENTER = SIZE / 2
const STROKE = 26
const R = 150
const CIRC = 2 * Math.PI * R
const GAP_DEG = 4 // small visual gap between arcs, in degrees

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type Props = {
  eyebrow?: string
  heading?: string
  sequence?: Persona[]
}

export function MindsetRing({
  eyebrow = 'Mindset Profile',
  heading = 'Your mind has a fingerprint. This is how we read it.',
  sequence = DEFAULT_SEQUENCE,
}: Props) {
  const steps = sequence.length

  const [active, setActive] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [vals, setVals] = useState<MindsetValues>(sequence[0].values)
  const [reduced, setReduced] = useState(false)

  const sectionRef = useRef<HTMLElement | null>(null)
  const rafScroll = useRef<number | null>(null)
  const rafTween = useRef<number | null>(null)

  // ── prefers-reduced-motion: static, representative state ────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (mq.matches) {
        const idx = Math.min(1, steps - 1) // Executive when present
        setReduced(true)
        setExiting(false)
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

  // ── Scroll → active step + exit (throttled with rAF) ────────────────────────
  useEffect(() => {
    if (reduced) return
    // One band per persona, plus a final band that floats everything away.
    const nBands = steps + 1
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
        const band = clamp(Math.floor(progress * nBands), 0, nBands - 1)
        const idx = Math.min(band, steps - 1)
        const exit = band >= steps
        setActive((prev) => (prev === idx ? prev : idx))
        setExiting((prev) => (prev === exit ? prev : exit))
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

  // ── Tween ring values when the active persona changes ───────────────────────
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

  // Whole-number percentages that always sum to exactly 100.
  const cerebralPct = Math.round(vals.cerebral)
  const alphaPct = Math.round(vals.alpha)
  const primePct = 100 - cerebralPct - alphaPct
  const shown: Record<keyof MindsetValues, number> = {
    cerebral: cerebralPct,
    alpha: alphaPct,
    prime: primePct,
  }

  const persona = sequence[active]
  const ariaLabel = `Mindset profile: ${cerebralPct}% Cerebral, ${alphaPct}% Alpha, ${primePct}% Prime — ${persona.label}`

  // ── Arcs + boundary node dots from live values ──────────────────────────────
  const fractions = ARC_ORDER.map((k) => vals[k] / 100)
  let cumulative = 0
  const gapFrac = GAP_DEG / 360
  const arcs = ARC_ORDER.map((key, i) => {
    const frac = fractions[i]
    const dim = DIMENSIONS.find((d) => d.key === key)!
    const dash = Math.max(0, frac - gapFrac) * CIRC
    const offset = -cumulative * CIRC
    const angle = (cumulative * 360 - 90 + GAP_DEG / 2) * (Math.PI / 180)
    const node = {
      x: CENTER + R * Math.cos(angle),
      y: CENTER + R * Math.sin(angle),
      color: dim.color,
    }
    cumulative += frac
    return { key, color: dim.color, dash, offset, node }
  })

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="mindset-ring-heading"
    >
      <div className={styles.sticky}>
        <div className={`${styles.stage} ${exiting ? styles.stageExit : ''}`}>
          {/* heading, centered at top */}
          <div className={styles.head}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="mindset-ring-heading" className={styles.heading}>
              {heading}
            </h2>
          </div>

          {/* floating persona images — alternating sides, edge-masked */}
          {sequence.map((p, i) => {
            const side = i % 2 === 0 ? styles.figLeft : styles.figRight
            const isActive = i === active && !exiting
            return (
              <figure
                key={p.key}
                className={`${styles.figure} ${side} ${isActive ? styles.figActive : ''}`}
                aria-hidden={isActive ? undefined : true}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.figImg}
                  src={p.image}
                  alt={isActive ? p.imageAlt : ''}
                  loading="lazy"
                />
                <figcaption className={styles.figCaption}>
                  <span className={styles.figTag}>{p.label}</span>
                  <span className={styles.figQuote}>{p.quote}</span>
                </figcaption>
              </figure>
            )
          })}

          {/* the ring — front and center */}
          <div className={styles.ringInner}>
            <svg
              className={styles.ring}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              role="img"
              aria-label={ariaLabel}
            >
              <circle
                cx={CENTER}
                cy={CENTER}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={STROKE}
              />
              <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
                {arcs.map((a) => (
                  <circle
                    key={a.key}
                    cx={CENTER}
                    cy={CENTER}
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={`${a.dash} ${CIRC}`}
                    strokeDashoffset={a.offset}
                  />
                ))}
              </g>
              {arcs.map((a) => (
                <circle
                  key={`node-${a.key}`}
                  cx={a.node.x}
                  cy={a.node.y}
                  r={7}
                  fill="var(--navy, #081c26)"
                  stroke={a.node.color}
                  strokeWidth={3}
                />
              ))}
              {/* NESTRE "N" monogram — clean geometric circuit N */}
              <g
                stroke="#fff"
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                <path d="M150 210 L150 150 L210 210 L210 150" />
                <circle cx={150} cy={150} r={5} fill="#fff" stroke="none" />
                <circle cx={210} cy={210} r={5} fill="#fff" stroke="none" />
              </g>
            </svg>

            {/* arc labels — real text, count up */}
            <div className={`${styles.label} ${styles.labelCerebral}`}>
              <span className={styles.labelVal} style={{ color: DIMENSIONS[0].color }}>
                {shown.cerebral}%
              </span>
              <span className={styles.labelName}>Cerebral</span>
            </div>
            <div className={`${styles.label} ${styles.labelAlpha}`}>
              <span className={styles.labelVal} style={{ color: DIMENSIONS[1].color }}>
                {shown.alpha}%
              </span>
              <span className={styles.labelName}>Alpha</span>
            </div>
            <div className={`${styles.label} ${styles.labelPrime}`}>
              <span className={styles.labelVal} style={{ color: DIMENSIONS[2].color }}>
                {shown.prime}%
              </span>
              <span className={styles.labelName}>Prime</span>
            </div>
          </div>

          {/* step markers */}
          {!reduced && (
            <ul className={styles.steps} aria-hidden="true">
              {sequence.map((p, i) => (
                <li
                  key={p.key}
                  className={`${styles.stepDot} ${i === active && !exiting ? styles.stepActive : ''}`}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default MindsetRing
