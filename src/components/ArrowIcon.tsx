import React from 'react'

/**
 * ArrowIcon — the thin outline diagonal arrow (↗) used on NESTRE CTAs.
 *
 * Replaces the bare "→" / "↗" text glyphs we used to inline, which iOS and
 * macOS render as a full-colour Apple emoji instead of type. Drawn as an inline
 * SVG at the same weight as the rest of our icon set (SiteFooter, Carousels:
 * 24-box, 1.6 stroke, round caps) and stroked in `currentColor`, so it inherits
 * the button's colour and can never fall back to a platform glyph.
 *
 * Sized in `em` so it tracks whatever font-size the button sets (.btn is 15px,
 * the veterans .pill is 13px) without a per-caller size.
 */
export function ArrowIcon() {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 24 24"
      width="1.1em"
      height="1.1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </svg>
  )
}

// Right/up-right arrow glyphs an author may have typed at the end of a CMS
// button label ("Learn more →"). Left/down arrows are deliberately excluded —
// swapping those for a ↗ would point the wrong way.
const TRAILING_ARROW = /\s*(?:[\u2192\u2197\u21d2\u27a1\u2794\u279c\u27f6]\ufe0f?)+\s*$/

/**
 * Splits a button label into its text and whether it ended in an arrow glyph,
 * so CMS-authored labels render the SVG icon instead of the emoji character.
 * Labels without a trailing arrow come back unchanged with `arrow: false`.
 */
export function splitArrowLabel(label: string): { text: string; arrow: boolean } {
  const text = label.replace(TRAILING_ARROW, '')
  return { text, arrow: text !== label }
}
