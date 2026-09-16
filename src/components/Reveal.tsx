'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Progressive enhancement: content ships visible (SSR/no-JS/SEO safe). On load,
// JS tags each section's key elements — copy, buttons, cards — and reveals them as
// they scroll into view (IntersectionObserver adds `.in`). A safety timer reveals
// anything still hidden after 2s, so content can NEVER stay stuck invisible even if
// the observer misbehaves after a Next soft-navigation. Respects reduced motion.
// NB: 'img'/'video' are intentionally NOT here — images get a continuous scroll
// PARALLAX (Carousels.tsx) instead of a one-shot reveal, so they feel alive.
const SEL = [
  '.eyebrow', '.kick', 'h1', 'h2', 'h3', 'h4', '.lead', 'p', '.btns', '.btn',
  '.statcard', '.step', '.panel', '.loc-card', '.row-item',
  '.feature-card', '.callout', '.faq-item', '.tag', '.thumb-lg', '.cap', 'blockquote', 'li',
].join(',')

export function Reveal() {
  // Re-run on every route change: how-it-works / neuro-labs / our-story etc. share
  // the one [[...slug]] route, so without a pathname dep the effect never re-fires
  // on soft-nav between them — new content would stay untagged and never reveal.
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

    // Reveal on a plain scroll listener (rect check) rather than IntersectionObserver
    // — the same reliable pattern the rest of the page uses (Carousels.tsx); IO proved
    // flaky after Next soft-nav. Each element animates in (`.in` → CSS transition) once
    // its top rises past ~92% of the viewport. Above-the-fold reveals immediately on
    // load. Runs on every scroll, so nothing scrolled into view can stay hidden.
    const tagged = Array.from(document.querySelectorAll('.reveal-child')) as HTMLElement[]
    const reveal = () => {
      const vh = window.innerHeight
      let remaining = false
      for (const el of tagged) {
        if (el.classList.contains('in')) continue
        const r = el.getBoundingClientRect()
        if (r.top < vh * 0.92 && r.bottom > -40) el.classList.add('in')
        else remaining = true
      }
      if (!remaining) window.removeEventListener('scroll', reveal)
    }
    reveal()
    window.addEventListener('scroll', reveal, { passive: true })
    window.addEventListener('resize', reveal)

    return () => { window.removeEventListener('scroll', reveal); window.removeEventListener('resize', reveal) }
  }, [pathname])
  return null
}
