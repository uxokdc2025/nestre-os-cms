'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Restores the original home carousels: any horizontal rail (.panels, .phones)
// gets prev/next arrow controls that scroll it by roughly one card. Arrows hide
// when the rail doesn't overflow, and disable at each end. No-JS: rails still
// scroll/swipe natively; arrows are pure enhancement.
export function Carousels() {
  // Re-run on route change: these pages share the one [[...slug]] route, so on
  // soft-nav the effect must re-attach its scroll handlers to the NEW page's
  // elements — otherwise stat bars, the sticky reveal, video autoplay and the
  // bottom-blur toggle only ever initialise on the first page loaded.
  const pathname = usePathname()
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

    // Progressive bottom blur fades OUT once the footer is reached — the footer is
    // never blurred (per design). Toggle .hide when the footer enters the viewport.
    const bottomBlur = document.querySelector('.bottom-blur') as HTMLElement | null
    // the footer is sticky (revealed as #main scrolls up), so detect the footer by
    // #main's bottom edge rising into the viewport — not the footer's own rect.
    const mainEl = document.querySelector('main#main') as HTMLElement | null
    if (bottomBlur && mainEl) {
      const onBlurToggle = () => {
        const atFooter = mainEl.getBoundingClientRect().bottom < window.innerHeight - 4
        bottomBlur.classList.toggle('hide', atFooter)
      }
      onBlurToggle()
      window.addEventListener('scroll', onBlurToggle, { passive: true })
      window.addEventListener('resize', onBlurToggle)
      cleanups.push(() => { window.removeEventListener('scroll', onBlurToggle); window.removeEventListener('resize', onBlurToggle) })
    }

    // HARD RULE for every sticky component: mark a section .framed once its LEFT
    // column is completely within the viewport — the right side (timeline items,
    // scorecard, and the vertical line) only begins transitioning after that.
    const framers = (Array.from(document.querySelectorAll('.sticky-rows, .stat-sticky')) as HTMLElement[])
      .map((sec) => ({ sec, left: sec.querySelector('.sticky-left') as HTMLElement | null }))
      .filter((f) => f.left)
    if (framers.length) {
      // gate the right column on JS being live (CSS keys the hidden state off this)
      document.documentElement.classList.add('sticky-js')
      const checkFramed = () => {
        const vh = window.innerHeight
        // A section at the very bottom of the page can never scroll its left up to
        // the pin — so once the page is scrolled to the end, frame any remaining
        // section that's in view (otherwise its right side would stay hidden forever).
        const atBottom = vh + window.scrollY >= document.documentElement.scrollHeight - 2
        let remaining = false
        for (const { sec, left } of framers) {
          if (sec.classList.contains('framed')) continue
          const r = left!.getBoundingClientRect()
          const h = left!.offsetHeight
          // The right side must NOT appear until the LEFT is fully in frame.
          //  · column fits the viewport → require the whole column in view
          //    (top settled at/above the top, bottom above the fold)
          //  · column taller than the viewport → require it PINNED at the top and
          //    still overflowing the bottom (i.e. it fills the screen). Never fires
          //    while the column's top is still mid-viewport (the old bug).
          const inView = r.top < vh && r.bottom > 0
          // Frame as a ONE-WAY latch once the left column has risen to the pin line.
          // The old `r.bottom >= vh - 8` made a tiny (~30px) window that normal
          // scrolling skipped whenever the column height was near the viewport
          // height — leaving the right side hidden. Only require the column to still
          // fill a good part of the screen, so the window is wide and un-skippable.
          const framed = (atBottom && inView)
            || (h <= vh - 88
              ? r.top >= -4 && r.bottom <= vh + 4
              : r.top <= 104 && r.bottom >= vh * 0.4)
          if (framed) sec.classList.add('framed')
          else remaining = true
        }
        if (!remaining) window.removeEventListener('scroll', checkFramed)
      }
      checkFramed()
      window.addEventListener('scroll', checkFramed, { passive: true })
      window.addEventListener('resize', checkFramed)
      cleanups.push(() => { window.removeEventListener('scroll', checkFramed); window.removeEventListener('resize', checkFramed) })
    }

    // Split-media frames: as the frame enters from the BOTTOM it rises into place
    // (no fade), and the image pans within the clipped frame at a different speed —
    // the frame and image move opposite/at different rates (parallax). Pronounced,
    // and it begins the moment the frame comes up from the bottom.
    const splitFrames = Array.from(document.querySelectorAll('main .split-media')) as HTMLElement[]
    if (splitFrames.length && !reduce) {
      splitFrames.forEach((f) => {
        f.style.willChange = 'transform'
        const im = f.querySelector('img, video') as HTMLElement | null
        if (im) im.style.willChange = 'translate'
      })
      let fraf = 0
      const runSplit = () => {
        fraf = 0
        const vh = window.innerHeight
        for (const f of splitFrames) {
          const im = f.querySelector('img, video') as HTMLElement | null
          if (!im) continue
          const r = f.getBoundingClientRect()
          if (r.bottom < -120 || r.top > vh + 120) continue
          // GATE: the frame stays held DOWN until the LEFT copy is framed (its top
          // has risen to ~28% down the viewport = fully in view), THEN it rises up
          // into place. So the left leads; the right follows.
          const copy = (f.closest('.split')?.querySelector('.split-copy') as HTMLElement | null) || f
          const copyTop = copy.getBoundingClientRect().top
          const framedLine = vh * 0.28
          const rise = Math.max(0, Math.min(1, (framedLine - copyTop) / (vh * 0.34)))
          f.style.transform = `translateY(${((1 - rise) * 120).toFixed(1)}px)`
          // image pans the other way within the frame (composes with CSS scale)
          const mid = (r.top + r.height / 2 - vh / 2) / vh // +.5 bottom → -.5 top
          im.style.translate = `0 ${(mid * 64).toFixed(1)}px`
        }
      }
      const onSplit = () => { if (!fraf) fraf = requestAnimationFrame(runSplit) }
      runSplit()
      window.addEventListener('scroll', onSplit, { passive: true })
      window.addEventListener('resize', onSplit)
      cleanups.push(() => { window.removeEventListener('scroll', onSplit); window.removeEventListener('resize', onSplit); if (fraf) cancelAnimationFrame(fraf) })
    }

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
  }, [pathname])
  return null
}
