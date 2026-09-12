'use client'

import React, { useEffect, useState } from 'react'

type Ctx =
  | { kind: 'page-doc' }
  | { kind: 'global'; slug: string }
  | { kind: 'collection'; slug: string; id: string }
  | { kind: 'none' }

function detect(pathname: string): Ctx {
  const parts = pathname.split('/').filter(Boolean) // ['admin','globals','nav'] | ['admin','collections','news','id']
  if (parts[1] === 'globals' && parts[2]) return { kind: 'global', slug: parts[2] }
  if (parts[1] === 'collections' && parts[2]) {
    if (parts[2] === 'pages') return { kind: 'page-doc' }
    if (parts[3] && parts[3] !== 'create') return { kind: 'collection', slug: parts[2], id: parts[3] }
  }
  return { kind: 'none' }
}

const label = (c: Ctx) =>
  c.kind === 'global' ? `the ${c.slug} settings`
  : c.kind === 'collection' ? `this ${c.slug.replace(/s$/, '')}`
  : ''

// Floating, context-aware AI assistant available on every admin screen.
export default function AdminAI({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [ctx, setCtx] = useState<Ctx>({ kind: 'none' })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setCtx(detect(window.location.pathname))
    update()
    const t = setInterval(update, 800) // admin is a SPA — re-read on navigation
    return () => clearInterval(t)
  }, [])

  const ask = async () => {
    if (!text.trim() || busy) return
    setBusy(true); setNote(null)
    try {
      const body =
        ctx.kind === 'global' ? { scope: 'global', slug: ctx.slug, instruction: text }
        : ctx.kind === 'collection' ? { scope: 'collection', slug: ctx.slug, id: ctx.id, instruction: text }
        : null
      if (!body) return
      const r = await fetch('/api/studio/edit-doc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      if (r.ok) { setNote('Updated ✓ refreshing…'); setTimeout(() => window.location.reload(), 700) }
      else setNote(j.error || 'Could not apply that.')
    } catch (e) { setNote(String(e)) } finally { setBusy(false) }
  }

  const editable = ctx.kind === 'global' || ctx.kind === 'collection'

  return (
    <>
      {children}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Ask AI"
          style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 9999, background: '#98d6d3', color: '#081c26', border: 'none', borderRadius: 999, padding: '12px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
          ✨ Ask AI
        </button>
      )}
      {open && (
        <div style={{ position: 'fixed', right: 22, bottom: 22, zIndex: 9999, width: 340, background: '#0e2a34', border: '1px solid rgba(152,214,211,.3)', borderRadius: 14, boxShadow: '0 18px 50px rgba(0,0,0,.45)', overflow: 'hidden', fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <strong style={{ color: '#fff', fontSize: 14 }}>✨ Ask AI</strong>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: 14 }}>
            {ctx.kind === 'page-doc' ? (
              <>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, margin: '0 0 12px' }}>Pages are best edited visually — open the Studio to click any element and tell AI what to change.</p>
                <a href="/studio" style={{ display: 'block', textAlign: 'center', background: '#98d6d3', color: '#081c26', fontWeight: 600, padding: '10px', borderRadius: 9, textDecoration: 'none' }}>Open Visual Studio →</a>
              </>
            ) : editable ? (
              <>
                <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 12.5, margin: '0 0 10px' }}>Editing {label(ctx)}. Describe the change:</p>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. “change the tagline to …” or “add a News item about …”"
                  style={{ width: '100%', boxSizing: 'border-box', resize: 'none', background: '#081c26', color: '#fff', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: 10, fontSize: 13.5, fontFamily: 'inherit' }} />
                <button onClick={ask} disabled={busy || !text.trim()}
                  style={{ width: '100%', marginTop: 8, background: '#98d6d3', color: '#081c26', fontWeight: 600, border: 'none', borderRadius: 9, padding: '10px', cursor: 'pointer', opacity: busy || !text.trim() ? 0.5 : 1 }}>
                  {busy ? 'Working…' : 'Ask AI'}
                </button>
                {note && <p style={{ color: '#98d6d3', fontSize: 12.5, margin: '10px 0 0' }}>{note}</p>}
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, margin: '0 0 12px' }}>Open a page, global, or item to edit it with AI — or jump into the visual Studio.</p>
                <a href="/studio" style={{ display: 'block', textAlign: 'center', background: 'rgba(152,214,211,.16)', color: '#98d6d3', fontWeight: 600, padding: '10px', borderRadius: 9, textDecoration: 'none', border: '1px solid rgba(152,214,211,.28)' }}>Open AI Studio →</a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
