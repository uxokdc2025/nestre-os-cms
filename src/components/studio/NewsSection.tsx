'use client'
import React, { useEffect, useState } from 'react'
import { Field, TextInput, TextArea, SectionHead, Btn, AskBar } from './ui'
import * as api from './api'

type News = { id?: number; title?: string; source?: string; date?: string; summary?: string; url?: string; published?: boolean }
const toDay = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export function NewsSection({ toast }: { toast: (s: string) => void }) {
  const [items, setItems] = useState<News[]>([])
  const [editing, setEditing] = useState<News | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => api.list('news').then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    setBusy(true)
    const data = { ...editing, date: editing.date ? new Date(editing.date).toISOString() : new Date().toISOString() }
    const res = editing.id ? await api.update('news', editing.id, data) : await api.create('news', data)
    setBusy(false)
    if (res.ok) { toast(editing.id ? 'Saved ✓' : 'Created ✓'); setEditing(null); load() } else toast(res.error || 'Save failed')
  }
  const del = async (id?: number) => {
    if (!id || !window.confirm('Delete this news item?')) return
    if (await api.remove('news', id)) { toast('Deleted'); setEditing(null); load() }
  }
  const ask = async (instruction: string) => {
    if (!editing?.id) { toast('Save the item first, then ask AI.'); return }
    setBusy(true)
    const r = await api.askDoc('collection', 'news', instruction, editing.id)
    setBusy(false)
    if (r.ok) { toast('Updated ✓'); const fresh = await api.getOne('news', editing.id); setEditing(fresh); load() } else toast(r.error || 'AI edit failed')
  }
  const createAI = async (instruction: string) => {
    setBusy(true)
    const r = await api.askDoc('collection', 'news', instruction) // no id → AI creates a new item
    setBusy(false)
    if (r.ok) { toast('Created ✓'); load() } else toast(r.error || 'AI create failed')
  }
  const createFromFile = async (file: File, note: string) => {
    setBusy(true)
    const fd = new FormData(); fd.set('file', file); fd.set('collection', 'news'); fd.set('instruction', note || 'Create a news article from this document.')
    const r = await fetch('/api/studio/ai-create-from-file', { method: 'POST', credentials: 'same-origin', body: fd }).then((x) => x.json()).catch(() => ({ error: 'upload failed' }))
    setBusy(false)
    if (r.ok) { toast(`Created “${r.title || 'item'}” ✓`); load() } else toast(r.error || 'Could not read that file')
  }

  if (editing) {
    const set = (k: keyof News, v: any) => setEditing({ ...editing, [k]: v }) // eslint-disable-line @typescript-eslint/no-explicit-any
    return (
      <div className="sf-page">
        <SectionHead title={editing.id ? 'Edit news item' : 'New news item'} action={<button className="sf-btn ghost" onClick={() => setEditing(null)}>Back to all news</button>} />
        <div className="sf-form">
          <Field label="Title"><TextInput value={editing.title || ''} onChange={(e) => set('title', e.target.value)} /></Field>
          <div className="sf-row">
            <Field label="Source" hint="Publication / partner, e.g. AdventHealth"><TextInput value={editing.source || ''} onChange={(e) => set('source', e.target.value)} /></Field>
            <Field label="Date"><TextInput type="date" value={toDay(editing.date)} onChange={(e) => set('date', e.target.value)} /></Field>
          </div>
          <Field label="Summary"><TextArea rows={2} value={editing.summary || ''} onChange={(e) => set('summary', e.target.value)} /></Field>
          <Field label="Article URL" hint="Where the story lives"><TextInput value={editing.url || ''} onChange={(e) => set('url', e.target.value)} placeholder="https://…" /></Field>
          <label className="sf-check"><input type="checkbox" checked={!!editing.published} onChange={(e) => set('published', e.target.checked)} /> Published (visible on /news)</label>
          <div className="sf-actions">
            {editing.id && <Btn variant="danger" onClick={() => del(editing.id)}>Delete</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={busy || !editing.title || !editing.url}>{busy ? 'Saving…' : 'Save'}</Btn>
          </div>
          {editing.id && <AskBar placeholder="Refine this item…" onAsk={ask} busy={busy} />}
        </div>
      </div>
    )
  }

  return (
    <div className="sf-page">
      <SectionHead title="News" sub="Press & partnerships shown on /news" action={<Btn onClick={() => setEditing({ published: true, date: new Date().toISOString() })}>+ New item</Btn>} />
      <div style={{ maxWidth: 760, marginBottom: 18 }}>
        <AskBar placeholder="Add a news item…" onAsk={createAI} onFile={createFromFile} fileAccept=".pdf,.docx,image/*" busy={busy} />
      </div>
      <div className="sf-list">
        {items.length === 0 && <p className="sf-empty">No news items yet. Add the first one.</p>}
        {items.map((n) => (
          <button key={n.id} className="sf-card" onClick={() => setEditing(n)}>
            <div className="sf-card-meta"><span>{n.source || '—'}</span><span>{toDay(n.date)}</span>{!n.published && <span className="sf-badge">Draft</span>}</div>
            <div className="sf-card-title">{n.title}</div>
            <div className="sf-card-sub">{n.url}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
