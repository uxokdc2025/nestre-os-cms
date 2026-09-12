import React from 'react'

// Persistent sidebar link to the visual AI Studio.
export default function StudioLink() {
  return (
    <a
      href="/studio"
      style={{ display: 'block', margin: '8px 0 4px', padding: '9px 12px', borderRadius: 8, background: 'rgba(152,214,211,.14)', border: '1px solid rgba(152,214,211,.28)', color: '#98d6d3', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
    >
      ✨ AI Studio
    </a>
  )
}
