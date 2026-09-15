'use client'

import React, { useEffect, useRef } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
const mediaUrl = (m: any): string | null =>
  m && typeof m === 'object' && 'url' in m ? (m.url ?? null) : null
const mediaAlt = (m: any): string =>
  m && typeof m === 'object' && 'alt' in m ? (m.alt ?? '') : ''

const isInternal = (href?: string | null) => !!href && href.startsWith('/') && !href.startsWith('//')
const isExternal = (href?: string | null) => !!href && /^https?:\/\//i.test(href)

// The App showcase: a PINNED scroll section. The copy holds on the left; as the
// viewer scrolls, the phones slide in from the right one after another until all
// three are fully on screen (never cut off) — then the section releases and the
// page continues up. Phone #3 (water) plays a video inside its frame.
export function PhoneShowcase({ block }: { block: any }) {
  const secRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sec = secRef.current
    const track = trackRef.current
    if (!sec || !track) return
    const phones = Array.from(track.children) as HTMLElement[]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const video = track.querySelector('video')
    if (video) { video.muted = true; const kick = () => video.play?.().catch(() => {}); kick(); video.addEventListener('canplay', kick) }

    if (reduce) {
      phones.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none' })
      return
    }
    let raf = 0
    const n = phones.length
    const apply = () => {
      raf = 0
      const rect = sec.getBoundingClientRect()
      const total = sec.offsetHeight - window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, total))) // 0 → 1 through the pinned range
      phones.forEach((el, i) => {
        // each phone reveals across its own slice of the first ~65% of the scroll,
        // staggered; the remaining scroll holds them all in place (pinned) before release
        const start = i * (0.62 / n)
        const rp = Math.max(0, Math.min(1, (p - start) / 0.34))
        el.style.opacity = String(rp)
        el.style.transform = `translateX(${((1 - rp) * 90).toFixed(1)}px)`
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const phones = ((block.phones || []) as any[]).slice(0, 3)

  return (
    <section ref={secRef} className="app-showcase app-pin">
      <div className="app-pin-sticky">
        <div className="wrap cols app-pin-inner">
          <div className="app-copy">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.body && <p className="lead muted">{block.body}</p>}
            {block.tags?.length ? (
              <div className="tags">{block.tags.map((t: any, i: number) => <span key={i} className="tag">{t.label}</span>)}</div>
            ) : null}
            {block.ctas?.length ? (
              <div className="btns">
                {block.ctas.filter((c: any) => !/what to expect/i.test(c.label || '')).map((c: any, i: number) => (
                  isInternal(c.href)
                    ? <a key={i} className={`btn ${c.style || 'aqua'}`} href={c.href!}>{c.label}</a>
                    : <a key={i} className={`btn ${c.style || 'aqua'}`} href={c.href || '#'} {...(isExternal(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="phone-stage">
            <div ref={trackRef} className="phone-track">
              {phones.map((p, i) => {
                const url = mediaUrl(p.image)
                const alt = mediaAlt(p.image)
                // posters that play a looping clip over the phone screen (poster filename → video filename)
                const VIDEO: Record<string, string> = { 'app-water.png': 'app-water.mp4', 'app-flower.png': 'app-bloom-loop.mp4' }
                const clip = url ? Object.keys(VIDEO).find((k) => url.includes(k)) : undefined
                const videoSrc = clip && url ? url.replace(clip, VIDEO[clip]) : null
                return (
                  <div key={i} className="phone">
                    <img src={url || ''} alt={alt} />
                    {videoSrc && (
                      <video className="phone-video" src={videoSrc} autoPlay muted loop playsInline preload="metadata" aria-hidden />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
