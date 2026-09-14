import React from 'react'

// Progressive bottom blur (à la neiden.framer.media): a fixed bar pinned to the
// bottom of the viewport, built from stacked backdrop-filter layers each masked
// by a gradient — so page content blurs PROGRESSIVELY toward the bottom edge
// (sharp at the top of the bar, fully soft at the very bottom). Pure CSS, no JS.
const LAYERS: Array<{ blur: number; to: number }> = [
  { blur: 0.5, to: 100 },
  { blur: 1, to: 84 },
  { blur: 2, to: 68 },
  { blur: 4, to: 52 },
  { blur: 8, to: 36 },
  { blur: 16, to: 20 },
]

export function BottomBlur() {
  return (
    <div className="bottom-blur" aria-hidden>
      {LAYERS.map((l, i) => {
        const mask = `linear-gradient(to top, #000 0%, transparent ${l.to}%)`
        return (
          <i
            key={i}
            style={{
              backdropFilter: `blur(${l.blur}px) saturate(1.15)`,
              WebkitBackdropFilter: `blur(${l.blur}px) saturate(1.15)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        )
      })}
    </div>
  )
}
