'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Progressive enhancement: content ships visible (SSR/no-JS/SEO safe). On load,
// JS tags each section's key elements — copy, buttons, cards, images — and staggers
// them in: above-the-fold animates immediately, the rest as they scroll into view.
// Respects reduced motion.
// NB: 'img'/'video' are intentionally NOT here — images get a continuous scroll
// PARALLAX (CSS, imgParallax) instead of a one-shot reveal, so they feel alive.
const SEL = [
  '.eyebrow', '.kick', 'h1', 'h2', 'h3', 'h4', '.lead', 'p', '.btns', '.btn',
  '.statcard', '.step', '.panel', '.loc-card', '.row-item',
  '.feature-card', '.callout', '.faq-item', '.tag', '.thumb-lg', '.cap', 'blockquote', 'li',
].join(',')

export function Reveal() {
  // Re-run on every route change: how-it-works / neuro-labs / our-story etc. share
  // the one [[...slug]] route, so without a pathname dep the effect never re-fires
  // on soft-nav between them — new content stays untagged and invisible.
  const pathname = usePathname()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Skip sections that drive their own motion — the hero (heroRise) and the
    // runner band (scroll parallax). Tagging their children with reveal-child
    // would apply a transform animation that overrides the parallax inline styles.
    const SELF_ANIMATED = 'hero runner-band closing-px'.split(' ')
    const sections = (Array.from(document.querySelectorAll('main section')) as HTMLElement[])
      .filter((s) => !SELF_ANIMATED.some((c) => s.classList.contains(c)))

    // Tag the outer-most animatable elements in each section (skip ones nested
    // inside another animatable element so cards rise as a unit, not doubled).
    for (const s of sections) {
      const all = Array.from(s.querySelectorAll(SEL)) as HTMLElement[]
      const outer = all.filter((el) => {
        let p = el.parentElement
        while (p && p !== s) { if (p.matches(SEL)) return false; p = p.parentElement }
        return true
      })
      const CARD = '.loc-card,.step,.panel,.news-item,.row-item,.statcard,.ncard,.feature-card'
      outer.forEach((el, i) => {
        el.classList.add('reveal-child')
        if (el.matches(CARD) && el.parentElement) {
          // cards restart the stagger within their own grid, with a bigger step
          el.classList.add('reveal-card')
          const sibs = Array.from(el.parentElement.children).filter((c) => (c as HTMLElement).matches(CARD))
          el.style.setProperty('--i', String(sibs.indexOf(el)))
        } else {
          el.style.setProperty('--i', String(Math.min(i, 12)))
        }
      })
    }

    // Reveal via IntersectionObserver — adds `.in` (CSS transitions it into view).
    // This survives Next.js soft-navigation; the old CSS scroll-timeline (view())
    // silently failed to attach on the newly-rendered page, leaving whole sections
    // stuck invisible until a hard refresh.
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.02 },
    )
    const tagged = Array.from(document.querySelectorAll('.reveal-child')) as HTMLElement[]
    const vh = window.innerHeight
    for (const el of tagged) {
      const r = el.getBoundingClientRect()
      // already on-screen at load → show immediately (no flash), else observe
      if (r.top < vh && r.bottom > 0) el.classList.add('in')
      else io.observe(el)
    }
    return () => io.disconnect()
  }, [pathname])
  return null
}
