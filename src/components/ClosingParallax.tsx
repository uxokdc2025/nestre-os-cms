'use client'

import React, { useEffect, useRef } from 'react'

type CTA = { label?: string; href?: string | null; style?: string }

// Scroll-driven closing: the framed image scales to full-bleed as you scroll,
// a vignette darkens it, the copy rises from the bottom, then the footer reveals.
export function ClosingParallax({ image, alt, heading, body, accentLine, ctas, copyRight }: {
  image?: string; alt?: string; heading?: string; body?: string; accentLine?: string; ctas?: CTA[]; copyRight?: boolean
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const vignRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // static resting state: full-bleed image, copy visible
      if (frameRef.current) { frameRef.current.style.width = '100%'; frameRef.current.style.height = '100%'; frameRef.current.style.borderRadius = '0' }
      if (vignRef.current) vignRef.current.style.opacity = '0.5'
      if (copyRef.current) { copyRef.current.style.clipPath = 'none'; copyRef.current.style.transform = 'none' }
      return
    }
    const clamp = (n: number) => Math.max(0, Math.min(1, n))
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const p = clamp(-rect.top / Math.max(1, rect.height - vh)) // 0 → 1 through the section
      const grow = ease(clamp(p / 0.62)) // image finishes growing at ~62%
      if (frameRef.current) {
        frameRef.current.style.width = `${lerp(66, 100, grow)}%`
        frameRef.current.style.height = `${lerp(60, 100, grow)}%`
        frameRef.current.style.borderRadius = `${lerp(22, 0, grow)}px`
      }
      if (vignRef.current) vignRef.current.style.opacity = `${lerp(0.12, 0.62, grow)}`
      const rise = ease(clamp((p - 0.48) / 0.5))
      if (copyRef.current) {
        // copy is revealed from inside via a clip mask (wipes up), with a touch of parallax drift
        copyRef.current.style.clipPath = `inset(${lerp(100, 0, rise)}% 0% 0% 0%)`
        copyRef.current.style.transform = `translateY(${lerp(34, 0, rise)}px)`
      }
      if (frameRef.current) frameRef.current.querySelector('img')?.setAttribute('style', `transform: scale(${lerp(1.12, 1, grow)})`) // subtle image parallax
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={sectionRef} className="closing-px">
      <div className="closing-sticky">
        <div ref={frameRef} className="closing-frame">
          {image && <img src={image} alt={alt || ''} />}
          <div ref={vignRef} className="closing-vign" aria-hidden />
          <div ref={copyRef} className={`closing-copy${copyRight ? ' copy-right' : ''}`}>
            <div className="closing-copy-inner">
              {accentLine && <p className="eyebrow">{accentLine}</p>}
              {heading && <h2 style={{ whiteSpace: 'pre-line' }}>{heading}</h2>}
              {body && <p className="closing-body">{body}</p>}
              {!!ctas?.length && (
                <div className="btns">
                  {ctas.map((c, i) => (
                    <a key={i} className={`btn ${c.style || 'aqua'}`} href={c.href || '#'} {...(/^https?:/.test(c.href || '') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
