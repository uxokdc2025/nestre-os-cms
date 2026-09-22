'use client'

import React from 'react'
import type { Region } from '@/lib/consult-pricing'

// Lets a visitor correct an inaccurate IP-geo guess for pricing. Writes the
// `nestre-region` cookie (read server-side by getRegion) and reloads so the
// dynamically-rendered price updates.
export function RegionToggle({ region }: { region: Region }) {
  const set = (r: Region) => {
    document.cookie = `nestre-region=${r}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`
    window.location.reload()
  }
  const isMonterey = region === 'monterey'
  return (
    <p className="region-toggle muted" style={{ fontSize: 13, marginTop: 10 }}>
      {isMonterey ? 'Showing Monterey pricing. ' : 'Showing pricing for our Florida Neuro Labs. '}
      <button
        type="button"
        onClick={() => set(isMonterey ? 'default' : 'monterey')}
        className="region-toggle-btn"
        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--aqua-ink, #0a8f88)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
      >
        {isMonterey ? 'See Florida pricing' : 'See Monterey pricing'}
      </button>
    </p>
  )
}
