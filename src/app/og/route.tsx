import { ImageResponse } from 'next/og'

// Fixed-path social card at /og (stable URL, robots-allowed). Referenced explicitly
// by openGraph.images / twitter.images so every page carries a large image card.
export const contentType = 'image/png'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '72px 80px',
          background: 'linear-gradient(135deg, #081c26 0%, #10212a 100%)', color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 6 }}>NESTRE</div>
          <div style={{ fontSize: 20, color: '#98d6d3', letterSpacing: 2 }}>NEURO-STRENGTH</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.05, maxWidth: 900 }}>
            Cognitive performance, made personal.
          </div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.75)', maxWidth: 860 }}>
            Capture your brain data. Train it with a NeuroTrainer.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 6, background: '#98d6d3', borderRadius: 6 }} />
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>nestreperformance.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
