'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// Horizontal rail used by both carousels on the ad landing pages (the client
// stories row and the testimonial quotes). Scroll/swipe works with no JS; the
// arrows are an enhancement and disable at each end. Kept separate from the
// site-wide Carousels rails (.panels/.phones) so the ad pages can snap by card
// without inheriting the home page's rail behaviour.
export function AdLandingRail({
  heading,
  ariaLabel,
  className,
  children,
}: {
  heading?: React.ReactNode
  ariaLabel: string
  className: string
  children: React.ReactNode
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync])

  const move = useCallback((dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    const step = (card?.offsetWidth ?? el.clientWidth * 0.8) + gap
    el.scrollBy({
      left: dir * step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) }
  }

  return (
    <>
      <div className="adl-railbar">
        {heading}
        <div className="adl-arrows">
          <button type="button" className="adl-arrow" aria-label="Previous" disabled={atStart} onClick={() => move(-1)}>←</button>
          <button type="button" className="adl-arrow" aria-label="Next" disabled={atEnd} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div
        ref={trackRef}
        className={className}
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        onScroll={sync}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </>
  )
}
