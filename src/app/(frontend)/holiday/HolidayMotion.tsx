'use client'

import { useEffect } from 'react'

// Behaviour for the holiday page, ported from Chloe's reference design:
//  • scroll reveals (each section fades/slides in as it enters the viewport)
//  • data bars, numbers and the Mindset Profile ring build when the sample is
//    in view and reset when it leaves, so they replay in either scroll direction
//  • the photo carousel drifts continuously (keeps moving on hover and while
//    the page scrolls), loops seamlessly, has Pause / Previous / Next, drag and
//    arrow keys
//  • testimonials are manual only (swipe + Previous/Next); no autoplay and no
//    wheel interception, so vertical page scrolling is never trapped
// Everything respects prefers-reduced-motion (no reveals, no drift, values shown
// at their final state, testimonial buttons still work instantly).
export function HolidayMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-holiday-page]')
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cleanups: Array<() => void> = []
    const on = <T extends EventTarget>(t: T, type: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions | boolean) => {
      t.addEventListener(type, fn, opts)
      cleanups.push(() => t.removeEventListener(type, fn, opts))
    }

    // ── Carousel ────────────────────────────────────────────────────────────
    const track = root.querySelector<HTMLElement>('#nh-goalTrack')
    const prev = root.querySelector<HTMLButtonElement>('#nh-goalsPrevious')
    const next = root.querySelector<HTMLButtonElement>('#nh-goalsNext')
    const pause = root.querySelector<HTMLButtonElement>('#nh-goalsPause')
    const position = root.querySelector<HTMLElement>('#nh-goalPosition')
    let raf = 0
    if (track && prev && next && pause && position) {
      const originals = Array.from(track.querySelectorAll<HTMLElement>('.nh-goal-card:not([data-clone])'))
      let userPaused = reduced.matches
      let visible = false
      let lastTime = 0
      let pixelRemainder = 0
      let dragging = false
      let dragStart = 0
      let scrollStart = 0
      let moved = false
      // After Previous/Next or a drag, hold the drift briefly so the smooth
      // scroll can finish (the reference set this but never read it, so its
      // buttons were cancelled by the drift after a few pixels).
      let resumeAt = 0
      const goalStep = () => originals[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0')
      const loopWidth = () => {
        const firstClone = track.children[originals.length] as HTMLElement | undefined
        return firstClone ? firstClone.offsetLeft - originals[0].offsetLeft : 0
      }
      const updatePosition = () => {
        const loop = loopWidth()
        const step = goalStep()
        if (!loop || !step) return
        position.textContent = `${(Math.floor((track.scrollLeft % loop) / step) % originals.length) + 1} of ${originals.length}`
      }
      const setPauseLabel = () => {
        pause.textContent = userPaused ? 'Play scrolling' : 'Pause scrolling'
        pause.setAttribute('aria-pressed', String(userPaused))
      }
      setPauseLabel()
      on(pause, 'click', () => { userPaused = !userPaused; setPauseLabel() })
      const move = (direction: number) => {
        resumeAt = performance.now() + 4500
        if (direction < 0 && track.scrollLeft < goalStep()) track.scrollLeft += loopWidth()
        track.scrollBy({ left: goalStep() * direction, behavior: reduced.matches ? 'instant' : 'smooth' })
      }
      on(prev, 'click', () => move(-1))
      on(next, 'click', () => move(1))
      on(track, 'scroll', updatePosition, { passive: true })
      on(window, 'resize', updatePosition)
      on(track, 'keydown', ((e: KeyboardEvent) => {
        if (e.target !== track) return
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1) }
      }) as EventListener)
      on(track, 'pointerdown', ((e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return
        dragging = true; moved = false; dragStart = e.clientX; scrollStart = track.scrollLeft
      }) as EventListener)
      on(window, 'pointermove', ((e: PointerEvent) => {
        if (!dragging) return
        const delta = e.clientX - dragStart
        if (Math.abs(delta) > 6) { moved = true; track.classList.add('nh-is-dragging'); track.scrollLeft = scrollStart - delta }
      }) as EventListener)
      on(window, 'pointerup', () => { if (dragging) resumeAt = performance.now() + 4500; dragging = false; track.classList.remove('nh-is-dragging') })
      on(track, 'click', ((e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false } }) as EventListener, true)
      on(track, 'dragstart', (e) => e.preventDefault())
      const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting }, { threshold: 0 })
      io.observe(track)
      cleanups.push(() => io.disconnect())
      const onReduced = (e: MediaQueryListEvent) => { if (e.matches) { userPaused = true; setPauseLabel() } }
      reduced.addEventListener('change', onReduced)
      cleanups.push(() => reduced.removeEventListener('change', onReduced))
      // Drift ~28px/s. Hover and page scroll deliberately do NOT pause it.
      const tick = (now: number) => {
        const dt = lastTime ? Math.min(now - lastTime, 50) : 0
        lastTime = now
        if (visible && !document.hidden && !userPaused && !dragging && now >= resumeAt) {
          const pixels = pixelRemainder + (28 * dt) / 1000
          const step = Math.floor(pixels)
          pixelRemainder = pixels - step
          track.scrollLeft += step
          const loop = loopWidth()
          if (loop > 0 && track.scrollLeft >= loop) track.scrollLeft -= loop
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      updatePosition()
    }

    // ── Scroll reveals ──────────────────────────────────────────────────────
    // The inline script in page.tsx adds .nh-reveal-ready before first paint.
    const revealItems = root.querySelectorAll<HTMLElement>('.nh-reveal-item')
    if ('IntersectionObserver' in window && !reduced.matches) {
      root.classList.add('nh-reveal-ready')
      const ro = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('nh-is-revealed'); ro.unobserve(entry.target) }
        })
      }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' })
      revealItems.forEach((el) => ro.observe(el))
      cleanups.push(() => ro.disconnect())
      const onReduced = (e: MediaQueryListEvent) => { if (e.matches) root.classList.remove('nh-reveal-ready') }
      reduced.addEventListener('change', onReduced)
      cleanups.push(() => reduced.removeEventListener('change', onReduced))
    } else {
      root.classList.remove('nh-reveal-ready')
    }

    // ── Data bars, numbers and Mindset Profile ring (replay on re-entry) ────
    const sample = root.querySelector<HTMLElement>('.nh-data-sample')
    const frames = new Map<Element, number>()
    if (sample && 'IntersectionObserver' in window && !reduced.matches) {
      sample.classList.add('nh-sample-animate')
      const jobs = new Map<Element, (p: number) => void>()
      sample.querySelectorAll<HTMLElement>('.nh-data-row').forEach((row) => {
        const el = row.querySelector<HTMLElement>('.nh-metric-line strong')
        if (!el) return
        const target = Number(el.dataset.target ?? el.textContent)
        el.setAttribute('aria-label', String(target))
        el.textContent = '0'
        jobs.set(row, (p) => { el.textContent = String(Math.round(target * p)) })
      })
      const profile = sample.querySelector<HTMLElement>('.nh-mindset-sample')
      if (profile) {
        const scores = Array.from(profile.querySelectorAll<HTMLElement>('.nh-profile-scores strong'))
        const targets = scores.map((el) => Number(el.dataset.target ?? parseInt(el.textContent || '0', 10)))
        const arcs = Array.from(profile.querySelectorAll<SVGPathElement>('.nh-profile-arc'))
        scores.forEach((el, i) => { el.setAttribute('aria-label', `${targets[i]} percent`); el.textContent = '0%' })
        arcs.forEach((el) => el.setAttribute('stroke-dasharray', '0 100'))
        jobs.set(profile, (p) => {
          scores.forEach((el, i) => { el.textContent = `${Math.round(targets[i] * p)}%` })
          arcs.forEach((el) => el.setAttribute('stroke-dasharray', `${100 * p} ${100 - 100 * p}`))
        })
      }
      const active = new Set<Element>()
      const reset = (el: Element) => {
        const id = frames.get(el)
        if (id !== undefined) cancelAnimationFrame(id)
        frames.delete(el); active.delete(el)
        el.classList.remove('nh-metric-loaded')
        jobs.get(el)?.(0)
      }
      const run = (el: Element) => {
        if (active.has(el)) return
        active.add(el)
        const draw = jobs.get(el)
        if (!draw) return
        el.classList.add('nh-metric-loaded')
        let start: number | undefined
        const frame = (now: number) => {
          if (!active.has(el)) return
          if (start === undefined) start = now
          const p = reduced.matches ? 1 : Math.min((now - start) / 1250, 1)
          draw(1 - Math.pow(1 - p, 3))
          if (p < 1) frames.set(el, requestAnimationFrame(frame))
          else frames.delete(el)
        }
        frames.set(el, requestAnimationFrame(frame))
      }
      // Observe the whole sample so every bar, number and the ring start and
      // reset together. Per-row 0.45 thresholds left Memory or the profile
      // percentages at 0 when only part of the sample was on screen.
      const bo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) jobs.forEach((_, el) => reset(el))
          else if (entry.intersectionRatio >= 0.2) jobs.forEach((_, el) => run(el))
        })
      }, { threshold: [0, 0.2, 0.35, 0.5] })
      bo.observe(sample)
      cleanups.push(() => bo.disconnect())
      const onReduced = (e: MediaQueryListEvent) => {
        if (e.matches) { bo.disconnect(); jobs.forEach((draw, el) => { reset(el); el.classList.add('nh-metric-loaded'); draw(1) }) }
        else { jobs.forEach((_, el) => reset(el)); bo.observe(sample) }
      }
      reduced.addEventListener('change', onReduced)
      cleanups.push(() => reduced.removeEventListener('change', onReduced))
    }

    // ── Testimonials: manual swipe only, never traps vertical scrolling ────
    const quotesTrack = root.querySelector<HTMLElement>('#nh-testimonialTrack')
    const quotesPrev = root.querySelector<HTMLButtonElement>('#nh-testimonialPrevious')
    const quotesNext = root.querySelector<HTMLButtonElement>('#nh-testimonialNext')
    if (quotesTrack && quotesPrev && quotesNext) {
      const updateQuoteControls = () => {
        quotesPrev.disabled = quotesTrack.scrollLeft <= 2
        quotesNext.disabled = quotesTrack.scrollLeft >= quotesTrack.scrollWidth - quotesTrack.clientWidth - 2
      }
      const moveQuote = (direction: number) => {
        const first = quotesTrack.firstElementChild as HTMLElement | null
        if (!first) return
        const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(quotesTrack).columnGap || getComputedStyle(quotesTrack).gap || '0')
        quotesTrack.scrollBy({ left: direction * step, behavior: reduced.matches ? 'instant' : 'smooth' })
      }
      on(quotesPrev, 'click', () => moveQuote(-1))
      on(quotesNext, 'click', () => moveQuote(1))
      on(quotesTrack, 'scroll', updateQuoteControls, { passive: true })
      on(window, 'resize', updateQuoteControls)
      on(quotesTrack, 'keydown', ((e: KeyboardEvent) => {
        if (e.target === quotesTrack && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault()
          moveQuote(e.key === 'ArrowRight' ? 1 : -1)
        }
      }) as EventListener)
      updateQuoteControls()
    }

    return () => {
      cancelAnimationFrame(raf)
      frames.forEach((id) => cancelAnimationFrame(id))
      cleanups.forEach((fn) => fn())
    }
  }, [])
  return null
}
