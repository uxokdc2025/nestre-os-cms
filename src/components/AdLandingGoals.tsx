'use client'

import React, { useCallback } from 'react'

// "What would you like to train for?" — the goal chips. Each one is a real
// anchor to the closing CTA band, so it still works with no JS; the click
// handler upgrades the jump to a glide.
//
// Why JS rather than `scroll-behavior: smooth`: the site sets
// `html { scroll-behavior: auto }` on purpose (styles.css) so route changes snap
// to the top instead of gliding up from the previous scroll position. In-page
// smooth scrolls are therefore all done here, with an explicit behavior.
//
// The header is `position: fixed`, so scroll to the target's top minus its
// height, otherwise the band's heading lands underneath it. 86 is the same
// offset `.adl-final` already carries as `scroll-margin-top` for the no-JS
// anchor jump, so both paths land in the same place.
const HEADER_OFFSET = 86

// In-page arrow: points the way the chip actually moves you (down the page, to
// the right as a chevron). Deliberately not the diagonal ↗ ArrowIcon, which we
// use for CTAs and links that leave the page.
const GoalArrow = () => (
  <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden focusable="false">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
)

export function AdLandingGoals({ choices, anchor }: { choices: string[]; anchor: string }) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let modified clicks (new tab/window) behave normally.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      const target = document.getElementById(anchor)
      if (!target) return // no target yet → leave the native anchor jump alone
      e.preventDefault()
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
      // Keep the URL in step without adding a history entry (so Back still
      // leaves the page rather than un-scrolling it).
      history.replaceState(null, '', `#${anchor}`)
    },
    [anchor],
  )

  return (
    <div className="adl-goal-grid">
      {choices.map((choice) => (
        <a key={choice} className="adl-goal" href={`#${anchor}`} onClick={onClick}>
          <span>{choice}</span>
          <GoalArrow />
        </a>
      ))}
    </div>
  )
}
