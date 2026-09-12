'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { NewsSection } from './studio/NewsSection'
import { UsersSection } from './studio/UsersSection'
import { MediaSection } from './studio/MediaSection'
import { NavSection } from './studio/NavSection'
import { SettingsSection } from './studio/SettingsSection'
import { BrandSection } from './studio/BrandSection'

type Section = 'pages' | 'news' | 'media' | 'nav' | 'footer' | 'brand' | 'users'
const SECTIONS: { id: Section; label: string; group: string }[] = [
  { id: 'pages', label: 'Pages', group: 'Content' },
  { id: 'news', label: 'News', group: 'Content' },
  { id: 'media', label: 'Media', group: 'Content' },
  { id: 'nav', label: 'Navigation', group: 'Site settings' },
  { id: 'footer', label: 'Footer', group: 'Site settings' },
  { id: 'brand', label: 'Brand', group: 'Site settings' },
  { id: 'users', label: 'Users & roles', group: 'Admin' },
]

type PageRef = { slug: string; title: string }
type Hint = { tag: string; role: string; text: string }
type Selected = { idx: number; type: string; hint?: Hint } | null
type Msg = { role: 'you' | 'ai'; text: string }
type Mode = 'page' | 'nav' | 'seo'
type SeoImage = { id: number; filename: string; alt: string }
type Seo = {
  metaTitle: string; metaDescription: string; canonical: string; ogImage: string
  schema: string[]; images: SeoImage[]; checks: { label: string; ok: boolean; hint: string }[]
}

const HILITE_CSS = `
.__ai_hover,.__ai_sel{position:absolute;pointer-events:none;z-index:2147483000;border-radius:8px;transition:all .04s linear}
.__ai_hover{border:2px solid #6bbdb9;background:rgba(107,189,185,.10)}
.__ai_sel{border:3px solid #2b6b66;box-shadow:0 0 0 3px rgba(107,189,185,.30);background:rgba(107,189,185,.06)}
html.__ai_studio *{cursor:crosshair!important}
`

const Svg = (p: React.ReactNode) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{p}</svg>
const ICON = {
  mic: Svg(<><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></>),
  clip: Svg(<path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />),
  image: Svg(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>),
  send: Svg(<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>),
  stop: Svg(<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />),
}

export function Studio({ pages: initialPages, initialSlug }: { pages: PageRef[]; initialSlug: string }) {
  const [pages, setPages] = useState(initialPages)
  const [slug, setSlug] = useState(initialSlug)
  const [mode, setMode] = useState<Mode>('page')
  const [selected, setSelected] = useState<Selected>(null)
  const [instruction, setInstruction] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [seo, setSeo] = useState<Seo | null>(null)
  const [navItems, setNavItems] = useState<{ label: string; href: string }[]>([])
  const [drag, setDrag] = useState<number | null>(null)
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [undoCount, setUndoCount] = useState(0)
  const [img, setImg] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('pages')
  const [sbOpen, setSbOpen] = useState(true)
  const [model, setModel] = useState<'auto' | 'haiku' | 'sonnet'>('auto')
  const [listening, setListening] = useState(false)
  const [delOpen, setDelOpen] = useState(false)
  const [delText, setDelText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const recogRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const selectedRef = useRef<Selected>(null)
  selectedRef.current = selected

  const iframeSrc = `/${slug === 'home' ? '' : slug}?studio=1`
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 3500) }

  const positionBox = (box: HTMLElement | null, el: Element | null, win: Window) => {
    if (!box) return
    if (!el) { box.style.display = 'none'; return }
    const r = el.getBoundingClientRect()
    Object.assign(box.style, { display: 'block', top: `${r.top + win.scrollY}px`, left: `${r.left + win.scrollX}px`, width: `${r.width}px`, height: `${r.height}px` })
  }

  const wireIframe = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    const win = iframe?.contentWindow
    if (!doc || !win) return
    doc.documentElement.classList.add('__ai_studio')
    if (!doc.getElementById('__ai_css')) { const s = doc.createElement('style'); s.id = '__ai_css'; s.textContent = HILITE_CSS; doc.head.appendChild(s) }
    const mk = (cls: string) => { const d = doc.createElement('div'); d.className = cls; d.style.display = 'none'; doc.body.appendChild(d); return d }
    const hover = mk('__ai_hover'); const sel = mk('__ai_sel')
    const EDITABLE = 'h1,h2,h3,h4,h5,h6,p,a,button,img,video,li,blockquote,figcaption,.eyebrow,.kick,.cap'
    // Resolve the finest editable element under the cursor, plus its owning block.
    const pick = (e: Event): { block: HTMLElement; el: HTMLElement } | null => {
      const t = e.target as Element
      const block = t?.closest?.('[data-block-idx]') as HTMLElement | null
      if (!block) return null
      let el = t?.closest?.(EDITABLE) as HTMLElement | null
      if (!el || !block.contains(el)) el = (block.firstElementChild as HTMLElement) || block
      return { block, el }
    }
    const describe = (el: HTMLElement): Hint => {
      const tag = el.tagName.toLowerCase()
      const role = /^h[1-6]$/.test(tag) ? 'heading'
        : tag === 'img' || tag === 'video' ? 'image'
        : tag === 'a' || tag === 'button' ? 'button'
        : el.classList.contains('eyebrow') || el.classList.contains('kick') ? 'eyebrow'
        : 'text'
      const text = role === 'image'
        ? (el.getAttribute('alt') || (el.getAttribute('src') || '').split('/').pop() || 'image')
        : (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
      return { tag, role, text }
    }
    doc.addEventListener('mousemove', (e) => positionBox(hover, pick(e)?.el || null, win), true)
    doc.addEventListener('mouseleave', () => { hover.style.display = 'none' }, true)
    doc.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation()
      const p = pick(e); if (!p) return
      setSelected({ idx: Number(p.block.dataset.blockIdx), type: p.block.dataset.blockType || 'block', hint: describe(p.el) })
      positionBox(sel, p.el, win)
    }, true)
    if (selectedRef.current) {
      const t = doc.querySelector(`[data-block-idx="${selectedRef.current.idx}"]`) as HTMLElement | null
      if (t) positionBox(sel, (t.firstElementChild as HTMLElement) || t, win)
    }
  }, [])

  useEffect(() => { setSelected(null) }, [slug])

  // Load SEO facts when the SEO tab is open (or the page changes).
  useEffect(() => {
    if (mode !== 'seo') return
    setSeo(null)
    fetch(`/api/studio/seo?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((j) => { if (j && !j.error) setSeo(j) })
  }, [mode, slug])

  // Load current nav when the Navigation tab opens (for the drag-reorder editor).
  useEffect(() => {
    if (mode !== 'nav') return
    fetch('/api/studio/nav').then((r) => r.json()).then((j) => { if (Array.isArray(j.items)) setNavItems(j.items.map((i: any) => ({ label: i.label || '', href: i.href || '' }))) })
  }, [mode])

  const saveNav = async (items = navItems) => {
    setBusy(true)
    try {
      const r = await fetch('/api/studio/nav', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) })
      const j = await r.json(); flash(r.ok ? 'Navigation saved ✓' : `Failed: ${j.error}`)
      if (r.ok) setTimeout(reloadIframe, 300)
    } finally { setBusy(false) }
  }
  const onDrop = (to: number) => {
    if (drag === null || drag === to) { setDrag(null); return }
    const next = [...navItems]; const [moved] = next.splice(drag, 1); next.splice(to, 0, moved)
    setNavItems(next); setDrag(null); saveNav(next)
  }

  const openDelete = () => {
    if (slug === 'home') { flash('The home page can’t be deleted.'); return }
    setDelText(''); setDelOpen(true)
  }
  const doDelete = async () => {
    if (delText.trim().toLowerCase() !== 'delete' || busy) return
    setBusy(true)
    try {
      const r = await fetch('/api/studio/delete-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
      const j = await r.json()
      if (r.ok) { setPages((p) => p.filter((x) => x.slug !== slug)); setDelOpen(false); flash(j.message || 'Deleted'); setSlug('home') }
      else flash(j.error || 'Delete failed')
    } finally { setBusy(false) }
  }

  const reloadIframe = () => { try { iframeRef.current?.contentWindow?.location.reload() } catch { /* noop */ } }
  const push = (role: Msg['role'], text: string) => setMsgs((m) => [...m, { role, text }])
  const refreshUndo = useCallback(() => { fetch(`/api/studio/undo?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((j) => setUndoCount(j.count ?? 0)).catch(() => {}) }, [slug])
  useEffect(() => { refreshUndo() }, [slug, refreshUndo])

  const undo = async () => {
    if (!undoCount || busy) return
    setBusy(true)
    try {
      const r = await fetch('/api/studio/undo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
      const j = await r.json()
      if (r.ok) { setUndoCount(j.count ?? 0); flash('Reverted last change ✓'); setTimeout(reloadIframe, 300) }
      else flash(j.error || 'Nothing to undo')
    } finally { setBusy(false) }
  }

  const send = async () => {
    const text = instruction.trim()
    if (!text || busy) return
    setInstruction(''); setBusy(true)
    push('you', mode === 'page' && selected ? `[${selected.type}] ${text}` : text)
    try {
      let url = '/api/ai-edit'; let body: any = { slug, instruction: text, blockIndex: selected?.idx ?? null, elementHint: selected?.hint ?? null, image: img, model, publish: true }
      if (mode === 'nav') { url = '/api/studio/nav'; body = { instruction: text } }
      if (mode === 'seo') { url = '/api/studio/seo'; body = { slug, instruction: text } }
      setImg(null)
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      push('ai', r.ok ? (j.message || 'Done.') : (j.error || 'Something went wrong.'))
      if (r.ok) {
        setTimeout(reloadIframe, 300)
        if (mode === 'page') refreshUndo()
        if (mode === 'seo') fetch(`/api/studio/seo?slug=${encodeURIComponent(slug)}`).then((x) => x.json()).then((x) => !x.error && setSeo(x))
      }
    } catch (e) { push('ai', `Error: ${String(e)}`) } finally { setBusy(false) }
  }

  const improveAlt = async (img: SeoImage) => {
    setBusy(true)
    try {
      const r = await fetch('/api/studio/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, mediaId: img.id, instruction: 'Write better, descriptive alt text for this image.' }) })
      const j = await r.json()
      if (r.ok) { flash('Alt text improved ✓'); setSeo((s) => s ? { ...s, images: s.images.map((i) => i.id === img.id ? { ...i, alt: j.alt } : i) } : s); setTimeout(reloadIframe, 300) }
      else flash(`Failed: ${j.error}`)
    } finally { setBusy(false) }
  }

  const newPage = async () => {
    const title = window.prompt('New page name (e.g. “Pricing”)')?.trim()
    if (!title) return
    setBusy(true)
    try {
      const r = await fetch('/api/studio/create-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
      const j = await r.json()
      if (r.ok) { setPages((p) => [...p, { slug: j.slug, title: j.title }].sort((a, b) => a.slug.localeCompare(b.slug))); setSlug(j.slug); setMode('page'); flash(`Created “${j.title}” — now edit it`) }
      else flash(j.error || 'Could not create page')
    } finally { setBusy(false) }
  }

  const readImage = (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader(); r.onload = () => setImg(String(r.result)); r.readAsDataURL(file)
  }

  // Upload an image to the media library (browser → Supabase via signed URL),
  // then place it in the selected block (if one is selected).
  const uploadImage = async (file?: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    setBusy(true)
    try {
      const sign = await fetch('/api/studio/upload-sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name }) }).then((r) => r.json())
      if (!sign.uploadUrl) { flash('Upload failed to start'); return }
      const put = await fetch(sign.uploadUrl, { method: 'PUT', headers: { 'content-type': file.type, 'x-upsert': 'true' }, body: file })
      if (!put.ok) { flash('Upload failed'); return }
      const dim = await new Promise<{ w: number; h: number }>((res) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ w: 0, h: 0 }); i.src = URL.createObjectURL(file) })
      const done = await fetch('/api/studio/upload-done', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: sign.filename, mime: file.type, size: file.size, width: dim.w, height: dim.h }) }).then((r) => r.json())
      if (!done.ok) { flash('Could not register image'); return }
      if (selected) {
        push('you', `[uploaded image → ${selected.hint?.role || selected.type}]`)
        const r = await fetch('/api/ai-edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, blockIndex: selected.idx, instruction: `Set the image in this block to media id ${done.id} (${done.filename}).`, model: 'haiku', publish: true }) })
        push('ai', r.ok ? 'Image placed ✓' : 'Uploaded, but placing failed — tell AI where to use it.')
        if (r.ok) { setTimeout(reloadIframe, 400); refreshUndo() }
      } else {
        flash(`Uploaded (image #${done.id}). Select a spot, then “use the uploaded image here”.`)
      }
    } finally { setBusy(false) }
  }
  const onPaste = (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'))
    if (item) { e.preventDefault(); readImage(item.getAsFile()) }
  }

  // Voice input — dictate the change (Web Speech API).
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) { flash('Voice input isn’t supported in this browser'); return }
    if (listening) { recogRef.current?.stop(); return }
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false
    const base = instruction ? instruction.trim() + ' ' : ''
    rec.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setInstruction(base + t) } // eslint-disable-line @typescript-eslint/no-explicit-any
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recogRef.current = rec; rec.start(); setListening(true)
  }

  const publish = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/publish-page', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
      const j = await r.json(); flash(r.ok ? `Published “${slug}” live ✓` : `Publish failed: ${j.error}`)
    } finally { setBusy(false) }
  }

  const placeholder = mode === 'nav' ? 'e.g. “Add a Pricing link to /pricing” or “rename The App to App”'
    : mode === 'seo' ? 'e.g. “Write a stronger meta description for this page”'
    : selected?.hint ? `Change this ${selected.hint.role}…`
    : selected ? `Tell AI what to change in this ${selected.type}…`
    : 'Click an element, then tell AI what to change…'

  return (
    <div className={`studio-shell${sbOpen ? '' : ' sb-collapsed'}`}>
      {!sbOpen && <button className="st-sb-open" onClick={() => setSbOpen(true)} aria-label="Open menu" title="Open menu">☰</button>}
      <aside className={`st-sidebar${sbOpen ? '' : ' collapsed'}`}>
        <div className="st-sb-top">
          <div className="st-sb-logo">Nestre CMS</div>
          <button className="st-sb-toggle" onClick={() => setSbOpen(false)} aria-label="Collapse menu" title="Collapse">‹</button>
        </div>
        <nav className="st-sb-nav">
          {['Content', 'Site settings', 'Admin'].map((g) => (
            <div key={g} className="st-sb-grp">
              <div className="st-sb-glabel">{g}</div>
              {SECTIONS.filter((s) => s.group === g).map((s) => (
                <button key={s.id} className={`st-sb-item${section === s.id ? ' on' : ''}`} onClick={() => setSection(s.id)}>{s.label}</button>
              ))}
            </div>
          ))}
        </nav>
        <div className="st-sb-foot">
          <a href="/" target="_blank" rel="noreferrer" className="st-sb-view">View site ↗</a>
          <a href="/admin/logout" className="st-sb-out">Log out</a>
        </div>
      </aside>

      <div className="studio-main">
      {section !== 'pages' ? (
        section === 'news' ? <NewsSection toast={flash} />
        : section === 'media' ? <MediaSection toast={flash} />
        : section === 'nav' ? <NavSection toast={flash} />
        : section === 'footer' ? <SettingsSection which="footer" toast={flash} />
        : section === 'brand' ? <BrandSection toast={flash} />
        : <UsersSection toast={flash} />
      ) : (
      <div className="studio">
      <header className="st-bar">
        <div className="st-left">
          <div className="st-pagepick" title="The page you're editing">
            <span className="st-pagepick-lead">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
              <span className="st-pagepick-label">Editing</span>
            </span>
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className="st-select">
              {pages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
            <span className="st-pagepick-slug">{slug === 'home' ? '/' : `/${slug}`}</span>
          </div>
          <button className="st-new" onClick={newPage} disabled={busy}>+ New page</button>
          {slug !== 'home' && <button className="st-del" onClick={openDelete} disabled={busy} title="Delete this page">Delete</button>}
          {mode === 'page' && selected && (
            <span className="st-chip">
              {selected.hint ? `${selected.hint.role}${selected.hint.text ? `: “${selected.hint.text.slice(0, 24)}${selected.hint.text.length > 24 ? '…' : ''}”` : ''}` : selected.type}
              <button onClick={() => setSelected(null)} aria-label="Clear">×</button>
            </span>
          )}
        </div>
        <div className="st-devices" role="group" aria-label="Preview size">
          {([['mobile', 'M', 'Mobile'], ['tablet', 'T', 'Tablet'], ['desktop', 'D', 'Desktop']] as const).map(([d, , label]) => (
            <button key={d} className={device === d ? 'on' : ''} onClick={() => setDevice(d)} title={label} aria-label={label} aria-pressed={device === d}>
              {d === 'mobile' ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="7" y="3" width="10" height="18" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                : d === 'tablet' ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="5" y="3" width="14" height="18" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/></svg>}
            </button>
          ))}
        </div>
        <div className="st-right">
          <button className="st-ghost-btn" onClick={undo} disabled={busy || !undoCount} title="Undo last change">↶ Undo{undoCount ? ` (${undoCount})` : ''}</button>
          <a className="st-ghost" href={`/${slug === 'home' ? '' : slug}`} target="_blank" rel="noreferrer">View live ↗</a>
          <button className="st-save" onClick={publish} disabled={busy}>Save &amp; Publish</button>
        </div>
      </header>

      <div className="st-body">
        <div className={`st-preview dev-${device}`}>
          <div className="st-frame">
            <iframe ref={iframeRef} src={iframeSrc} onLoad={wireIframe} title="Page preview" />
          </div>
          {mode === 'page' && <p className="st-hint">Click any element — a heading, button or image — then tell the AI what to change.</p>}
        </div>

        <aside className="st-chat">
          <div className="st-tabs">
            {(['page', 'seo'] as Mode[]).map((m) => (
              <button key={m} className={`st-tab ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
                {m === 'page' ? 'Edit page' : 'SEO'}
              </button>
            ))}
          </div>

          {mode === 'seo' ? (
            <div className="st-seo">
              {!seo ? <p className="st-muted">Loading SEO…</p> : (
                <>
                  <div className="st-seo-block">
                    <p className="st-h">What’s live on this page</p>
                    <ul className="st-checks">
                      {seo.checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : 'warn'}><span>{c.ok ? '✓' : '!'}</span> {c.label} <em>{c.hint}</em></li>)}
                    </ul>
                  </div>
                  <div className="st-seo-block">
                    <p className="st-h">Meta title</p><p className="st-val">{seo.metaTitle || '—'}</p>
                    <p className="st-h">Meta description</p><p className="st-val">{seo.metaDescription || '—'}</p>
                    <p className="st-h">Canonical</p><p className="st-val mono">{seo.canonical}</p>
                  </div>
                  <div className="st-seo-block">
                    <p className="st-h">Structured data (JSON-LD)</p>
                    <div className="st-tagrow">{seo.schema.map((s) => <span key={s} className="st-tag">{s}</span>)}</div>
                  </div>
                  <div className="st-seo-block">
                    <p className="st-h">Images &amp; alt text ({seo.images.length})</p>
                    {seo.images.map((img) => (
                      <div key={img.id} className="st-img">
                        <img src={`/api/media/file/${img.filename}`} alt="" />
                        <div>
                          <p className={`st-alt ${img.alt ? '' : 'missing'}`}>{img.alt || 'No alt text'}</p>
                          <button className="st-mini" onClick={() => improveAlt(img)} disabled={busy}>Improve with AI</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {mode === 'nav' && (
                <div className="st-nav-ed">
                  <p className="st-h" style={{ margin: '14px 18px 6px' }}>Drag to reorder · click to edit</p>
                  <ul className="st-navlist">
                    {navItems.map((it, i) => (
                      <li key={i} className={drag === i ? 'dragging' : ''}
                        onDragOver={(e) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' }} onDrop={() => onDrop(i)}>
                        <span className="st-grip" aria-hidden title="Drag to reorder"
                          draggable
                          onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) }}
                          onDragEnd={() => setDrag(null)}>⠿</span>
                        <input value={it.label} onChange={(e) => setNavItems((n) => n.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} onBlur={() => saveNav()} placeholder="Label" />
                        <input value={it.href} onChange={(e) => setNavItems((n) => n.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} onBlur={() => saveNav()} placeholder="/path" className="mono" />
                        <button className="st-x" onClick={() => { const next = navItems.filter((_, j) => j !== i); setNavItems(next); saveNav(next) }} aria-label="Remove">×</button>
                      </li>
                    ))}
                  </ul>
                  <button className="st-add" onClick={() => setNavItems((n) => [...n, { label: 'New link', href: '/' }])}>+ Add link</button>
                  <p className="st-h" style={{ margin: '16px 18px 6px' }}>…or just tell AI</p>
                </div>
              )}
            <div className="st-log">
              {msgs.length === 0 && (
                <div className="st-empty">
                  <p>{mode === 'nav' ? 'Edit the site navigation:' : 'Try:'}</p>
                  <ul>
                    {mode === 'nav'
                      ? [<li key="1">“Add a Pricing link to /pricing”</li>, <li key="2">“Remove For Teams from the menu”</li>, <li key="3">“Rename ‘The App’ to ‘App’”</li>, <li key="4">“Change the button to ‘Get started’”</li>]
                      : [<li key="1">“Change the headline to ‘Train your mind.’”</li>, <li key="2">“Make this section navy”</li>, <li key="3">“Swap this image for the runner photo”</li>, <li key="4">“Add a new steps section after this one”</li>]}
                  </ul>
                </div>
              )}
              {msgs.map((m, i) => <div key={i} className={`st-msg ${m.role}`}>{m.text}</div>)}
              {busy && <div className="st-msg ai">…thinking</div>}
            </div>
            </>
          )}

          <div className="st-composer-wrap">
            <div className={`st-composer${listening ? ' listening' : ''}`}>
              {img && (
                <div className="st-attach">
                  <img src={img} alt="attachment" />
                  <span>Screenshot attached</span>
                  <button onClick={() => setImg(null)} aria-label="Remove image">×</button>
                </div>
              )}
              <textarea className="st-composer-input" value={instruction} onChange={(e) => setInstruction(e.target.value)} onPaste={onPaste}
                onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px' }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={placeholder} rows={1} />
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => readImage(e.target.files?.[0])} />
              <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => { uploadImage(e.target.files?.[0]); e.target.value = '' }} />
              <div className="st-composer-bar">
                <div className="st-composer-actions">
                  <button className={`st-ic${listening ? ' rec' : ''}`} onClick={toggleVoice} title={listening ? 'Stop' : 'Speak your change'} aria-label="Voice input">{listening ? ICON.stop : ICON.mic}</button>
                  {mode === 'page' && <>
                    <button className="st-ic" onClick={() => fileRef.current?.click()} title="Attach a screenshot" aria-label="Attach screenshot">{ICON.clip}</button>
                    <button className="st-ic" onClick={() => uploadRef.current?.click()} title="Upload an image" aria-label="Upload image">{ICON.image}</button>
                  </>}
                </div>
                <div className="st-composer-actions">
                  <button className="st-send" onClick={send} disabled={busy || (!instruction.trim() && !img)} aria-label="Send" title="Send">{ICON.send}</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
      </div>
      )}
      </div>
      {toast && <div className="st-toast">{toast}</div>}

      {delOpen && (
        <div className="st-modal-scrim" onClick={() => setDelOpen(false)}>
          <div className="st-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Delete “{pages.find((p) => p.slug === slug)?.title || slug}”?</h3>
            <p className="st-modal-warn">This cannot be undone. The page and its content will be permanently removed.</p>
            <label className="st-modal-label">Type <b>delete</b> to confirm</label>
            <input autoFocus value={delText} onChange={(e) => setDelText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doDelete() }} placeholder="delete" className="st-modal-input" />
            <div className="st-modal-actions">
              <button className="st-modal-cancel" onClick={() => setDelOpen(false)}>Cancel</button>
              <button className="st-modal-del" onClick={doDelete} disabled={busy || delText.trim().toLowerCase() !== 'delete'}>Delete page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
