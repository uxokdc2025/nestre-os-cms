'use client'

import { useEffect } from 'react'

// Restores the original home carousels: any horizontal rail (.panels, .phones)
// gets prev/next arrow controls that scroll it by roughly one card. Arrows hide
// when the rail doesn't overflow, and disable at each end. No-JS: rails still
// scroll/swipe natively; arrows are pure enhancement.
export function Carousels() {
  useEffect(() => {
    // Global hero "learn more" → smooth-scroll to the section below the hero.
    const onScrollCta = (e: MouseEvent) => {
      const a = (e.target as Element)?.closest?.('a[href="#next"], .hero-scroll') as HTMLElement | null
      if (!a) return
      e.preventDefault()
      const target = document.getElementById('next')
        || (document.querySelector('main .hero') as HTMLElement | null)?.closest('[data-block-idx]')?.nextElementSibling
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    document.addEventListener('click', onScrollCta)

    // G2 — videos autoplay (muted) once ~halfway into view, pause when out.
    const vids = Array.from(document.querySelectorAll('main video')) as HTMLVideoElement[]
    vids.forEach((v) => { v.muted = true; v.loop = true; v.playsInline = true; v.removeAttribute('controls') })
    const vio = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement
        if (e.isIntersecting) v.play?.().catch(() => {})
        else v.pause?.()
      }
    }, { threshold: 0.5 })
    vids.forEach((v) => vio.observe(v))

    // stat badges count up 0 → value once they scroll into view. Uses a plain
    // scroll listener (rect check) rather than IntersectionObserver — IO proved
    // unreliable in the field, this fires wherever the element is on screen.
    const nums = Array.from(document.querySelectorAll('main .stat-num')) as HTMLElement[]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const runCount = (el: HTMLElement) => {
      const target = parseInt(el.dataset.n || '0', 10)
      const delay = (parseInt(el.style.getPropertyValue('--r') || '0', 10)) * 70 + 80
      if (reduce) { el.textContent = String(target); return }
      setTimeout(() => {
        const t0 = performance.now(), dur = 900
        const tick = (t: number) => {
          const p = Math.min((t - t0) / dur, 1)
          el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }, delay)
    }
    // A scorecard is usually taller than the viewport, so checking each element
    // against vh*0.9 leaves the lower rows stuck (never in the top 90% at once).
    // Instead fire as soon as the CARD CONTAINER overlaps the viewport at all —
    // the whole card animates together (numbers count up, bars grow).
    const containerOf = (el: HTMLElement) =>
      (el.closest('.statcard, .scorecard-card, .stat-right, .feature-card') || el.parentElement || el) as HTMLElement
    const inViewport = (el: HTMLElement) => {
      const r = containerOf(el).getBoundingClientRect()
      // The sticky runner scorecard waits until the section is FULLY framed (the
      // card has risen well up the viewport) before it animates — so the left side
      // is settled first. Everything else fires on first overlap.
      const topGate = el.closest('.stat-scroll') ? window.innerHeight * 0.42 : window.innerHeight * 0.95
      return r.top < topGate && r.bottom > window.innerHeight * 0.05
    }
    // Bars grow from 0 → their --w once in view (see styles.css transition).
    const bars = Array.from(document.querySelectorAll('main .statrow .bar > i')) as HTMLElement[]
    const growBar = (i: HTMLElement) => { const w = i.style.getPropertyValue('--w'); if (w) i.style.width = w }
    let pending = nums.slice()
    let pendingBars = bars.slice()
    const checkNums = () => {
      pending = pending.filter((el) => { if (inViewport(el)) { containerOf(el).classList.add('in'); runCount(el); return false } return true })
      pendingBars = pendingBars.filter((el) => { if (inViewport(el)) { containerOf(el).classList.add('in'); growBar(el); return false } return true })
      if (!pending.length && !pendingBars.length) window.removeEventListener('scroll', checkNums)
    }
    window.addEventListener('scroll', checkNums, { passive: true })
    checkNums() // catch any already on screen at load
    // Also poll on a timer — the count then fires reliably even if no scroll event
    // arrives (section already in view, a stop-scroll, or throttled events).
    const numsPoll = window.setInterval(() => { checkNums(); if (!pending.length && !pendingBars.length) window.clearInterval(numsPoll) }, 200)
    window.setTimeout(() => window.clearInterval(numsPoll), 20000)

    // Image parallax: every content image is oversized (CSS scale) and pans
    // vertically as its frame moves through the viewport — the frame and the image
    // move at different speeds. Scroll-listener driven so it works everywhere
    // (inside horizontal carousels, sticky columns, anywhere CSS view() stalls).
    const pimgs = Array.from(document.querySelectorAll(
      'main .ncard-media img, main .panel img, main .thumb-lg img, main .step .thumb img, main .loc-img img, main .fr-media img',
    )) as HTMLElement[]
    pimgs.forEach((im) => { im.style.willChange = 'transform' })
    let praf = 0
    const parallax = () => {
      praf = 0
      const vh = window.innerHeight
      for (const im of pimgs) {
        const frame = im.parentElement
        if (!frame) continue
        const r = frame.getBoundingClientRect()
        if (r.bottom < -40 || r.top > vh + 40) continue
        const off = (r.top + r.height / 2 - vh / 2) / vh // -0.5 (top) … +0.5 (bottom)
        const ty = (off * -26).toFixed(1) // moves opposite to scroll → parallax depth
        // set the `translate` property (NOT transform) so the CSS `scale` (base +
        // smooth hover grow) composes independently and never fights this per-frame
        // update — no transform-transition restart = no scroll jank.
        im.style.translate = `0 ${ty}px`
      }
    }
    const onParallax = () => { if (!praf) praf = requestAnimationFrame(parallax) }
    if (!reduce) { parallax(); window.addEventListener('scroll', onParallax, { passive: true }); window.addEventListener('resize', onParallax) }

    const rails = Array.from(document.querySelectorAll('main .panels, main .phones')) as HTMLElement[]
    const cleanups: (() => void)[] = [() => document.removeEventListener('click', onScrollCta), () => vio.disconnect(), () => window.removeEventListener('scroll', checkNums), () => { window.removeEventListener('scroll', onParallax); window.removeEventListener('resize', onParallax); if (praf) cancelAnimationFrame(praf) }]

    // hero slowly grows (zoom + subtle drift) as you scroll away from it
    const heroBg = document.querySelector('main .hero .bg') as HTMLElement | null
    const heroEl = document.querySelector('main .hero') as HTMLElement | null
    if (heroBg && heroEl && !reduce) {
      heroBg.style.willChange = 'transform'
      heroBg.style.transformOrigin = 'center'
      let hraf = 0
      const zoom = () => {
        hraf = 0
        const p = Math.max(0, Math.min(1, window.scrollY / (heroEl.offsetHeight || 1)))
        heroBg.style.transform = `scale(${(1 + p * 0.18).toFixed(4)})`
      }
      const onZoom = () => { if (!hraf) hraf = requestAnimationFrame(zoom) }
      zoom()
      window.addEventListener('scroll', onZoom, { passive: true })
      cleanups.push(() => { window.removeEventListener('scroll', onZoom); if (hraf) cancelAnimationFrame(hraf) })
    }

    for (const rail of rails) {
      if (rail.dataset.railed) continue
      rail.dataset.railed = '1'

      const nav = document.createElement('div')
      nav.className = 'rail-nav'
      const mk = (dir: 'prev' | 'next') => {
        const b = document.createElement('button')
        b.className = 'rail-arrow'
        b.type = 'button'
        b.setAttribute('aria-label', dir === 'prev' ? 'Previous' : 'Next')
        b.innerHTML = dir === 'prev'
          ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
          : '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
        b.addEventListener('click', () => {
          const first = rail.querySelector(':scope > *') as HTMLElement | null
          const step = first ? first.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8
          rail.scrollBy({ left: dir === 'prev' ? -step : step, behavior: 'smooth' })
        })
        return b
      }
      const prev = mk('prev'); const next = mk('next')
      nav.append(prev, next)
      rail.before(nav) // arrows sit ABOVE the carousel, consistent across all rails

      const update = () => {
        const overflow = rail.scrollWidth - rail.clientWidth > 8
        nav.style.display = overflow ? '' : 'none'
        prev.disabled = rail.scrollLeft <= 2
        next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2
      }
      update()
      rail.addEventListener('scroll', update, { passive: true })
      window.addEventListener('resize', update)
      cleanups.push(() => { rail.removeEventListener('scroll', update); window.removeEventListener('resize', update); nav.remove(); delete rail.dataset.railed })
    }
    return () => cleanups.forEach((c) => c())
  }, [])
  return null
}
