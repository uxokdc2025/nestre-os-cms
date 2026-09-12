'use client'

import React, { useEffect, useRef } from 'react'

// Section-2 band: an athlete mid-stride who "flies" across as you scroll past —
// the runner drifts horizontally (and bobs) faster than the page, headline copy
// rises alongside. Uses a rAF-throttled scroll listener (the reliable pattern,
// same as ClosingParallax) — never an IntersectionObserver.
export function RunnerParallax({
  image = '/img/runner.png',
  eyebrow = 'The engine underneath',
  heading = 'Train the mind\nthat drives the body.',
  body = 'Every rep, every mile, every decision starts upstream — in how your mind fires. NESTRE trains that engine directly.',
}: { image?: string; eyebrow?: string; heading?: string; body?: string }) {
  const sectionRef = useRef<HTMLElement>(null)
  const runnerRef = useRef<HTMLImageElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const clamp = (n: number) => Math.max(0, Math.min(1, n))
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 as the section enters the bottom of the viewport → 1 as it leaves the top
      const p = clamp((vh - rect.top) / (vh + rect.height))
      if (runnerRef.current) {
        // he faces right — flies FORWARD (rightward) as you scroll, staying prominent
        // through the middle of the band. Linear drift keeps him on-screen at centre.
        const x = lerp(-12, 30, p)
        const bob = Math.sin(p * Math.PI * 3) * 2.4
        const scale = lerp(1.14, 1.0, p)
        runnerRef.current.style.transform = `translate3d(${x}%, ${bob}%, 0) scale(${scale})`
      }
      if (copyRef.current) {
        const rise = ease(clamp((p - 0.12) / 0.55))
        copyRef.current.style.opacity = String(clamp(rise * 1.4))
        copyRef.current.style.transform = `translateY(${lerp(40, 0, rise)}px)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={sectionRef} className="runner-band" aria-label="Train the mind that drives the body">
      <div className="runner-glow" aria-hidden />
      <img ref={runnerRef} className="runner-img" src={image} alt="An athlete mid-stride, powering forward" />
      <div className="wrap runner-inner">
        <div ref={copyRef} className="runner-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2 style={{ whiteSpace: 'pre-line' }}>{heading}</h2>
          <p className="runner-body">{body}</p>
        </div>
      </div>
    </section>
  )
}
