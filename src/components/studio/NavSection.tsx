'use client'
import React, { useEffect, useState } from 'react'
import { AskBar } from './ui'
import { SectionShell } from './SectionShell'

type Item = { label: string; href: string }

export function NavSection({ toast }: { toast: (s: string) => void }) {
  const [items, setItems] = useState<Item[]>([])
  const [cta, setCta] = useState<{ label?: string; href?: string }>({})
  const [drag, setDrag] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  const load = () => fetch('/api/studio/nav', { credentials: 'same-origin' }).then((r) => r.json()).then((j) => { setItems((j.items || []).map((i: any) => ({ label: i.label || '', href: i.href || '' }))); setCta(j.cta || {}) }) // eslint-disable-line @typescript-eslint/no-explicit-any
  useEffect(() => { load() }, [])

  const save = async (next = items, nextCta = cta) => {
    setBusy(true)
    const r = await fetch('/api/studio/nav', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ items: next, cta: nextCta }) })
    setBusy(false); toast(r.ok ? 'Saved ✓' : 'Save failed'); if (r.ok) setReload((x) => x + 1)
  }
  const onDrop = (to: number) => { if (drag === null || drag === to) return setDrag(null); const n = [...items]; const [m] = n.splice(drag, 1); n.splice(to, 0, m); setItems(n); setDrag(null); save(n) }
  const ask = async (instruction: string) => {
    setBusy(true)
    const r = await fetch('/api/studio/nav', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ instruction }) }).then((x) => x.json())
    setBusy(false); if (r.ok) { toast('Updated ✓'); load(); setReload((x) => x + 1) } else toast(r.error || 'AI edit failed')
  }

  return (
    <SectionShell previewUrl="/?studio=1" reloadSignal={reload}>
      <div className="sf-panel-head"><h2>Navigation</h2><p>The header menu — drag to reorder, or tell AI</p></div>
      <div className="sf-panel-body">
        <ul className="sf-navlist">
          {items.map((it, i) => (
            <li key={i} className={drag === i ? 'dragging' : ''} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)}>
              <span className="sf-grip" draggable onDragStart={(e) => { setDrag(i); e.dataTransfer.setData('text/plain', String(i)) }} onDragEnd={() => setDrag(null)}>⠿</span>
              <input value={it.label} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} onBlur={() => save()} placeholder="Label" />
              <input value={it.href} className="mono" onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} onBlur={() => save()} placeholder="/path" />
              <button className="sf-x" onClick={() => { const n = items.filter((_, j) => j !== i); setItems(n); save(n) }} aria-label="Remove">×</button>
            </li>
          ))}
        </ul>
        <button className="sf-add" onClick={() => setItems([...items, { label: 'New link', href: '/' }])}>+ Add link</button>
        <div className="sf-cta-edit">
          <span className="sf-label">Button (CTA)</span>
          <input className="sf-input" value={cta.label || ''} onChange={(e) => setCta({ ...cta, label: e.target.value })} onBlur={() => save()} placeholder="Book a Consultation" />
          <input className="sf-input mono" value={cta.href || ''} onChange={(e) => setCta({ ...cta, href: e.target.value })} onBlur={() => save()} placeholder="/book-a-consultation" />
        </div>
        <AskBar placeholder="Add or rename a link…" onAsk={ask} busy={busy} />
      </div>
    </SectionShell>
  )
}
