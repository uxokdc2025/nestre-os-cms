'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// A "NESTRE is for" client film.
//
// Shipping rules, learned the hard way: the clips were delivered as .mov, which
// Chrome and most Android browsers refuse to decode — so the only source served
// is the H.264/AAC MP4 (yuv420p, faststart), which plays everywhere. `playsInline` is
// what stops iOS Safari hijacking the clip into its fullscreen player, and
// `muted` is what lets it autoplay at all; both are required together.
//
// Carousels.tsx autoplays every <main> video (muted) once it scrolls into view
// and pauses it on the way out. Autoplay is still refused outright in iOS Low
// Power Mode and under some data savers, so the card doubles as a tap target:
// tapping toggles play/pause, and a play badge shows whenever the film is paused.
//
// Sound (Chloe, Nov 18 — matches the approved prototype): the speaker button in
// the top-right corner turns the sound on, and restarts that film from 0:00 so
// the story is heard from the beginning. Only one film ever plays with sound:
// turning one on mutes every other persona film on the page. Tapping it again
// mutes it. The tap is a user gesture, so iOS allows the unmuted play().

// Every mounted persona film, so turning one's sound on can mute the rest.
const films = new Set<HTMLVideoElement>()

const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none" />
    {on ? <path d="M15 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14" /> : <path d="m16 9 5 6m0-6-5 6" />}
  </svg>
)

export function PersonaVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    films.add(v)
    return () => { films.delete(v) }
  }, [])

  const toggle = useCallback(() => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  const toggleSound = useCallback(() => {
    const v = ref.current
    if (!v) return
    const turnOn = v.muted
    if (turnOn) {
      // One voice at a time: silence every other persona film first.
      films.forEach((other) => { if (other !== v) other.muted = true })
      v.currentTime = 0
      v.muted = false
      if (v.paused) v.play().catch(() => {})
    } else {
      v.muted = true
    }
  }, [])

  return (
    <>
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
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        />
        <span className={`adl-person-badge${paused ? '' : ' is-playing'}`} aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
            <path d="M9 6.5v11l9-5.5-9-5.5Z" />
          </svg>
        </span>
      </button>
      <button
        type="button"
        className={`adl-person-sound${muted ? '' : ' is-on'}`}
        onClick={toggleSound}
        aria-pressed={!muted}
        aria-label={`${muted ? 'Turn sound on' : 'Mute'} — ${label}`}
        title={muted ? 'Sound on' : 'Mute'}
      >
        <SoundIcon on={!muted} />
      </button>
    </>
  )
}
