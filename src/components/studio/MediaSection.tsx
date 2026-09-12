'use client'
import React, { useEffect, useRef, useState } from 'react'
import { SectionHead, Btn, Field, TextArea } from './ui'
import * as api from './api'

type M = { id: number; filename: string; alt?: string; mimeType?: string; width?: number; height?: number; filesize?: number }
const isImg = (m: M) => (m.mimeType || '').startsWith('image')
const kb = (n?: number) => (n ? (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB') : '—')

async function dims(file: File) {
  return new Promise<{ w: number; h: number }>((res) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ w: 0, h: 0 }); i.src = URL.createObjectURL(file) })
}

export function MediaSection({ toast }: { toast: (s: string) => void }) {
  const [media, setMedia] = useState<M[]>([])
  const [sel, setSel] = useState<M | null>(null)
  const [alt, setAlt] = useState('')
  const [busy, setBusy] = useState(false)
  const [ver, setVer] = useState(0) // cache-bust the preview after a replace
  const [drop, setDrop] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)

  const load = () => api.list('media').then(setMedia)
  useEffect(() => { load() }, [])
  const open = (m: M) => { setSel(m); setAlt(m.alt || ''); setVer(0) }

  const upload = async (file?: File | null, key?: string) => {
    if (!file) return
    setBusy(true)
    try {
      const sign = await fetch('/api/studio/upload-sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ filename: file.name, key }) }).then((r) => r.json())
      if (!sign.uploadUrl) { toast('Upload failed to start'); return }
      const put = await fetch(sign.uploadUrl, { method: 'PUT', headers: { 'content-type': file.type, 'x-upsert': 'true' }, body: file })
      if (!put.ok) { toast('Upload failed'); return }
      const d = await dims(file)
      if (key && sel) { // replace-in-place: same object key, just refresh dims
        await api.update('media', sel.id, { width: d.w, height: d.h, mimeType: file.type, filesize: file.size })
        toast('Image replaced ✓'); setVer((v) => v + 1); load()
      } else {
        const done = await fetch('/api/studio/upload-done', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ filename: sign.filename, mime: file.type, size: file.size, width: d.w, height: d.h }) }).then((r) => r.json())
        toast(done.ok ? 'Uploaded ✓' : 'Register failed'); load()
      }
    } finally { setBusy(false) }
  }

  const saveAlt = async () => { if (!sel) return; setBusy(true); await api.update('media', sel.id, { alt }); setBusy(false); toast('Alt text saved ✓'); load() }
  const aiAlt = async () => {
    if (!sel) return; setBusy(true)
    const r = await fetch('/api/studio/describe-media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ id: sel.id }) }).then((x) => x.json()).catch(() => ({ error: 'failed' }))
    setBusy(false)
    if (r.ok) { setAlt(r.alt); toast('Alt text generated ✓'); load() } else toast(r.error || 'Could not generate')
  }

  // ---- detail view ----
  if (sel) {
    const src = `/api/media/file/${sel.filename}${ver ? `?v=${ver}` : ''}`
    return (
      <div className="sf-page">
        <SectionHead title="Media detail" sub={sel.filename} action={<button className="sf-btn ghost" onClick={() => setSel(null)}>Back to library</button>} />
        <div className="sf-media-detail">
          <div
            className={`sf-media-hero${drop ? ' drop' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrop(true) }}
            onDragLeave={() => setDrop(false)}
            onDrop={(e) => { e.preventDefault(); setDrop(false); upload(e.dataTransfer.files?.[0], sel.filename) }}
          >
            {isImg(sel) ? <img src={src} alt={sel.alt || ''} /> : <span className="sf-media-file lg">{(sel.mimeType || 'file').split('/')[1] || 'file'}</span>}
            <div className="sf-media-dropmsg">Drop an image to replace</div>
            <input ref={replaceRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0], sel.filename); e.currentTarget.value = '' }} />
          </div>
          <div className="sf-media-meta">
            <Field label="Alt text (SEO / accessibility)">
              <TextArea rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe this image…" />
            </Field>
            <div className="sf-actions" style={{ marginTop: 4 }}>
              <button className="sf-btn ghost" onClick={aiAlt} disabled={busy}>✨ Generate with AI</button>
              <Btn onClick={saveAlt} disabled={busy}>Save alt</Btn>
            </div>
            <dl className="sf-meta-list">
              <div><dt>File</dt><dd>{sel.filename}</dd></div>
              <div><dt>Type</dt><dd>{sel.mimeType || '—'}</dd></div>
              <div><dt>Dimensions</dt><dd>{sel.width && sel.height ? `${sel.width} × ${sel.height}` : '—'}</dd></div>
              <div><dt>Size</dt><dd>{kb(sel.filesize)}</dd></div>
            </dl>
            <button className="sf-btn ghost" onClick={() => replaceRef.current?.click()} disabled={busy}>{busy ? 'Working…' : '⬆ Replace image'}</button>
          </div>
        </div>
      </div>
    )
  }

  // ---- grid ----
  return (
    <div className="sf-page">
      <SectionHead title="Media library" sub={`${media.length} files · click to edit`}
        action={<><input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.currentTarget.value = '' }} /><Btn onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? 'Uploading…' : '⬆ Upload'}</Btn></>} />
      <div className="sf-mediagrid">
        {media.map((m) => (
          <button key={m.id} className="sf-mediacard" onClick={() => open(m)}>
            <div className="sf-media-thumb">{isImg(m) ? <img src={`/api/media/file/${m.filename}`} alt={m.alt || ''} loading="lazy" /> : <span className="sf-media-file">{(m.mimeType || 'file').split('/')[1] || 'file'}</span>}</div>
            <div className="sf-media-name" title={m.filename}>{m.filename}</div>
            <div className={`sf-media-altbadge${m.alt ? ' ok' : ''}`}>{m.alt ? 'alt ✓' : 'no alt'}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
