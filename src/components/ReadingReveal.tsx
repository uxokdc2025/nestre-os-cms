'use client'

import { useEffect } from 'react'

// Scroll "reading" reveal: body copy starts dimmed; each word brightens to full
// strength as it scrolls up past a reading line — as if the viewer is reading it.
// Targets section lead paragraphs. Reliable scroll-listener (not scroll-timeline).
export function ReadingReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // ONLY the aqua statement blocks — never regular body copy (which must stay full strength).
    const targets = Array.from(document.querySelectorAll('main .callout-copy')) as HTMLElement[]
    if (!targets.length) return

    const allSpans: HTMLElement[] = []
    // wrap each word in a .rw span, preserving nested elements (e.g. the bold
    // .callout-lead) so their styling survives.
    const wrapNode = (node: ChildNode) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment()
        for (const w of (node.textContent || '').split(/(\s+)/)) {
          if (w === '' || /^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); continue }
          const s = document.createElement('span'); s.className = 'rw'; s.textContent = w
          frag.appendChild(s); allSpans.push(s)
        }
        node.replaceWith(frag)
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(wrapNode)
      }
    }
    for (const el of targets) {
      el.classList.remove('reveal-child')
      el.classList.add('reading')
      Array.from(el.childNodes).forEach(wrapNode)
    }

    let raf = 0
    const paint = () => {
      raf = 0
      const vh = window.innerHeight
      const readLine = vh * 0.62 // words above this are "read" (bright)
      const band = vh * 0.26 // fade distance
      for (const s of allSpans) {
        const r = s.getBoundingClientRect()
        if (r.top > vh || r.bottom < 0) continue
        const p = (readLine - r.top) / band
        s.style.opacity = String(Math.max(0.16, Math.min(1, p)))
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return null
}
