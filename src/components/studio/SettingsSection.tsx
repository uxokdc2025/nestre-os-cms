'use client'
import React, { useEffect, useState } from 'react'
import { Field, TextInput, TextArea, Btn, AskBar } from './ui'
import { SectionShell } from './SectionShell'
import * as api from './api'

export function SettingsSection({ which, toast }: { which: 'footer' | 'brand'; toast: (s: string) => void }) {
  const [data, setData] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => { setData(null); api.getGlobal(which).then((g) => setData(g || {})) }, [which])
  const set = (k: string, v: any) => setData((d: any) => ({ ...d, [k]: v })) // eslint-disable-line @typescript-eslint/no-explicit-any

  const save = async () => {
    setBusy(true)
    const payload = which === 'footer'
      ? { tagline: data.tagline, legalNote: data.legalNote, contactEmail: data.contactEmail, contactPhone: data.contactPhone, columns: data.columns }
      : { name: data.name, tagline: data.tagline }
    const res = await api.updateGlobal(which, payload)
    setBusy(false)
    if (res.ok) { toast('Saved ✓ — live on the site'); setReload((r) => r + 1) } else toast(res.error || 'Save failed')
  }
  const ask = async (instruction: string) => {
    setBusy(true)
    const r = await api.askDoc('global', which, instruction)
    setBusy(false)
    if (r.ok) { toast('Updated ✓'); api.getGlobal(which).then(setData); setReload((x) => x + 1) } else toast(r.error || 'AI edit failed')
  }

  const previewUrl = '/?studio=1'
  return (
    <SectionShell previewUrl={previewUrl} scrollToBottom={which === 'footer'} reloadSignal={reload}>
      <div className="sf-panel-head">
        <h2>{which === 'footer' ? 'Footer' : 'Brand'}</h2>
        <p>{which === 'footer' ? 'Tagline, contact & legal — live in the footer →' : 'Company name & tagline'}</p>
      </div>
      {!data ? <p className="sf-empty">Loading…</p> : (
        <div className="sf-panel-body">
          {which === 'footer' ? (
            <>
              <Field label="Tagline"><TextArea rows={2} value={data.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></Field>
              <Field label="Contact email"><TextInput value={data.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
              <Field label="Contact phone"><TextInput value={data.contactPhone || ''} onChange={(e) => set('contactPhone', e.target.value)} /></Field>
              <Field label="Legal note"><TextArea rows={2} value={data.legalNote || ''} onChange={(e) => set('legalNote', e.target.value)} /></Field>
            </>
          ) : (
            <>
              <Field label="Brand name"><TextInput value={data.name || ''} onChange={(e) => set('name', e.target.value)} /></Field>
              <Field label="Tagline"><TextInput value={data.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></Field>
            </>
          )}
          <div className="sf-actions"><div style={{ flex: 1 }} /><Btn onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save'}</Btn></div>
          <AskBar placeholder={which === 'footer' ? 'Change the tagline…' : 'Update the tagline…'} onAsk={ask} busy={busy} />
        </div>
      )}
    </SectionShell>
  )
}
