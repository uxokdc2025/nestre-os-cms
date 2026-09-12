'use client'

import { useRef } from 'react'

// Autoplays muted + looping (the global in-view observer also plays/pauses it as
// it enters/leaves the frame). Ships the poster for SSR/SEO. No audio control —
// these clips are silent b-roll.
export function PodcastPlayer({ videoUrl, posterUrl, alt }: { videoUrl?: string; posterUrl?: string; alt?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  if (!videoUrl) {
    return (
      <div className="thumb-lg">
        {posterUrl && <img src={posterUrl} alt={alt || ''} />}
        {posterUrl && <span className="play" aria-hidden>▶</span>}
      </div>
    )
  }

  return (
    <div className="thumb-lg">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={ref} src={videoUrl} poster={posterUrl} autoPlay muted loop playsInline preload="metadata"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}
