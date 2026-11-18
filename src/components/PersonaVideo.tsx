'use client'

import { useCallback, useRef, useState } from 'react'

// A "NESTRE is for" client film.
//
// Shipping rules, learned the hard way: the clips were delivered as .mov, which
// Chrome and most Android browsers refuse to decode — so the only source served
// is the H.264/AAC MP4 (yuv420p, faststart), which plays everywhere. `playsInline` is
// what stops iOS Safari hijacking the clip into its fullscreen player, and
// `muted` is what lets it autoplay at all; both are required together.
//
// Carousels.tsx autoplays every <main> video once it scrolls into view and
// pauses it on the way out. That covers the normal case. Autoplay is still
// refused outright in iOS Low Power Mode and under some data savers, so the
// card doubles as a tap target: tapping toggles play/pause, and a play badge
// shows whenever the film is sitting paused.
export function PersonaVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)

  const toggle = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      v.muted = true // a tap can only start a muted clip on iOS
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [])

  return (
    <button type="button" className="adl-person-play" onClick={toggle} aria-label={`${paused ? 'Play' : 'Pause'} — ${label}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
      <span className={`adl-person-badge${paused ? '' : ' is-playing'}`} aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
          <path d="M9 6.5v11l9-5.5-9-5.5Z" />
        </svg>
      </span>
    </button>
  )
}
