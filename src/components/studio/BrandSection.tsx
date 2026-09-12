'use client'
import React, { useEffect, useState } from 'react'
import { Field, TextInput, Btn, AskBar } from './ui'
import { SectionShell } from './SectionShell'
import * as api from './api'

type Color = { token: string; value: string }
const DEFAULTS: Color[] = [
  { token: 'navy', value: '#081c26' }, { token: 'ink', value: '#10212a' },
  { token: 'paper', value: '#f4f3ee' }, { token: 'aqua', value: '#98d6d3' },
  { token: 'aqua-deep', value: '#6bbdb9' }, { token: 'muted', value: '#52666d' },
]
const LABELS: Record<string, string> = { navy: 'Dark / hero', ink: 'Text', paper: 'Light background', aqua: 'Accent', 'aqua-deep': 'Accent (hover)', muted: 'Muted text' }

export function BrandSection({ toast }: { toast: (s: string) => void }) {
  const [data, setData] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  const load = () => api.getGlobal('brand').then((g) => {
    const colors: Color[] = (g?.colors?.length ? g.colors : DEFAULTS).map((c: any) => ({ token: c.token, value: c.value })) // eslint-disable-line @typescript-eslint/no-explicit-any
    setData({ ...g, colors, radius: g?.radius || '999px', headingFont: g?.headingFont || '', bodyFont: g?.bodyFont || '' })
  })
  useEffect(() => { load() }, [])
  const set = (k: string, v: any) => setData((d: any) => ({ ...d, [k]: v })) // eslint-disable-line @typescript-eslint/no-explicit-any
  const setColor = (i: number, v: string) => setData((d: any) => ({ ...d, colors: d.colors.map((c: Color, j: number) => j === i ? { ...c, value: v } : c) })) // eslint-disable-line @typescript-eslint/no-explicit-any

  const save = async () => {
    setBusy(true)
    const res = await api.updateGlobal('brand', { name: data.name, tagline: data.tagline, colors: data.colors, radius: data.radius, headingFont: data.headingFont, bodyFont: data.bodyFont })
    setBusy(false)
    if (res.ok) { toast('Saved ✓ — live on the site'); setReload((r) => r + 1) } else toast(res.error || 'Save failed')
  }
  const ask = async (t: string) => { setBusy(true); const r = await api.askDoc('global', 'brand', t); setBusy(false); if (r.ok) { toast('Updated ✓'); load(); setReload((x) => x + 1) } else toast(r.error || 'AI failed') }
  const fromFile = async (file: File) => {
    setBusy(true)
    const fd = new FormData(); fd.set('file', file)
    const r = await fetch('/api/studio/brand-from-file', { method: 'POST', credentials: 'same-origin', body: fd }).then((x) => x.json()).catch(() => ({ error: 'upload failed' }))
    setBusy(false)
    if (r.ok) { toast('Design system applied ✓'); load(); setReload((x) => x + 1) } else toast(r.error || 'Could not read that file')
  }

  const c = (t: string) => data?.colors?.find((x: Color) => x.token === t)?.value
  const preview = data ? { navy: c('navy') || '#081c26', aqua: c('aqua') || '#98d6d3', aquaDeep: c('aqua-deep') || '#6bbdb9', ink: c('ink') || '#10212a', paper: c('paper') || '#f4f3ee', radius: data.radius } : null

  return (
    <SectionShell previewUrl="/?studio=1" reloadSignal={reload}>
      <div className="sf-panel-head"><h2>Brand &amp; design system</h2><p>Colors, type and shape — live across the whole site →</p></div>
      {!data ? <p className="sf-empty">Loading…</p> : (
        <div className="sf-panel-body">
          <Field label="Brand name"><TextInput value={data.name || ''} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Tagline"><TextInput value={data.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></Field>

          <div>
            <span className="sf-label">Colors</span>
            <div className="sf-swatches">
              {data.colors.map((col: Color, i: number) => (
                <label key={col.token} className="sf-swatch">
                  <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(col.value) ? col.value : '#000000'} onChange={(e) => setColor(i, e.target.value)} />
                  <div><b>{LABELS[col.token] || col.token}</b><code>{col.value}</code></div>
                </label>
              ))}
            </div>
          </div>

          <div className="sf-row2">
            <Field label="Corner radius"><TextInput value={data.radius || ''} onChange={(e) => set('radius', e.target.value)} placeholder="999px" /></Field>
            <Field label="Heading font"><TextInput value={data.headingFont || ''} onChange={(e) => set('headingFont', e.target.value)} placeholder="Instrument Sans" /></Field>
          </div>
          <Field label="Body font"><TextInput value={data.bodyFont || ''} onChange={(e) => set('bodyFont', e.target.value)} placeholder="Instrument Sans" /></Field>

          {preview && (
            <div className="sf-brand-preview" style={{ background: preview.navy, borderRadius: 12 }}>
              <span className="sf-label" style={{ color: 'rgba(255,255,255,.55)' }}>Preview</span>
              <h3 style={{ color: '#fff', margin: '6px 0 12px' }}>Performance. From within.</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ background: preview.aqua, color: preview.ink, padding: '10px 18px', borderRadius: preview.radius, fontWeight: 600, fontSize: 14 }}>Primary</span>
                <span style={{ border: `1px solid ${preview.aqua}`, color: preview.aqua, padding: '10px 18px', borderRadius: preview.radius, fontWeight: 600, fontSize: 14 }}>Secondary</span>
              </div>
            </div>
          )}

          <div className="sf-actions"><div style={{ flex: 1 }} /><Btn onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn></div>
          <AskBar placeholder="Change a color or font…" onAsk={ask} onFile={fromFile} fileAccept=".pdf,.docx,image/*" busy={busy} />
        </div>
      )}
    </SectionShell>
  )
}
