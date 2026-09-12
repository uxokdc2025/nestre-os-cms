import React from 'react'

// Prominent entry point to the visual AI Studio, shown atop the admin dashboard.
export default function DashboardBanner() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        margin: '0 0 34px', padding: '22px 26px', borderRadius: 14,
        background: 'linear-gradient(100deg, #0e2a34 0%, #123943 100%)', border: '1px solid rgba(152,214,211,.28)',
      }}
    >
      <div>
        <div style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#98d6d3', fontWeight: 600 }}>Visual editor</div>
        <div style={{ fontSize: 21, fontWeight: 600, color: '#fff', marginTop: 6 }}>Edit your pages with AI</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', marginTop: 4, maxWidth: '60ch' }}>
          Open the AI Studio, go to any page, click an element, and tell the AI what to change — then Save &amp; Publish.
        </div>
      </div>
      <a
        href="/studio"
        style={{ background: '#98d6d3', color: '#081c26', fontWeight: 600, fontSize: 15, padding: '12px 22px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        Open AI Studio →
      </a>
    </div>
  )
}
