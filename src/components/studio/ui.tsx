'use client'
import React from 'react'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="sf-field">
      <span className="sf-label">{label}</span>
      {children}
      {hint && <span className="sf-hint">{hint}</span>}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`sf-input ${props.className || ''}`} />
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`sf-input sf-textarea ${props.className || ''}`} />
}

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="sf-head">
      <div>
        <h1 className="sf-title">{title}</h1>
        {sub && <p className="sf-sub">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function Btn({ variant = 'primary', ...props }: { variant?: 'primary' | 'ghost' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`sf-btn sf-btn-${variant} ${props.className || ''}`} />
}

/** Consistent Ask-AI bar used across sections. */
export function AskBar({ placeholder, onAsk, busy, onFile, fileAccept }: { placeholder: string; onAsk: (text: string) => void; busy?: boolean; onFile?: (file: File, text: string) => void; fileAccept?: string }) {
  const [text, setText] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)
  const [listening, setListening] = React.useState(false)
  const recog = React.useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const fileRef = React.useRef<HTMLInputElement>(null)
  const go = () => {
    if (busy) return
    if (file && onFile) { onFile(file, text.trim()); setFile(null); setText(''); return }
    if (text.trim()) { onAsk(text.trim()); setText('') }
  }
  const voice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) return
    if (listening) { recog.current?.stop(); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true
    const base = text ? text.trim() + ' ' : ''
    r.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setText(base + t) } // eslint-disable-line @typescript-eslint/no-explicit-any
    r.onend = () => setListening(false); r.onerror = () => setListening(false)
    recog.current = r; r.start(); setListening(true)
  }
  return (
    <div className={`sf-ask${listening ? ' listening' : ''}`}>
      <span className="sf-ask-spark">✨</span>
      {onFile && <input ref={fileRef} type="file" accept={fileAccept || '.pdf,.docx,image/*'} hidden onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = '' }} />}
      <div className="sf-ask-main">
        {file && (
          <div className="sf-ask-file">
            <span>📎 {file.name}</span>
            <button onClick={() => setFile(null)} aria-label="Remove file">×</button>
          </div>
        )}
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder={file ? 'Add a note (optional) — then Create' : placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go() } }}
          onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }} />
      </div>
      {onFile && (
        <button className="sf-ask-ic" onClick={() => fileRef.current?.click()} title="Attach a PDF, Word doc or image" aria-label="Attach file">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
        </button>
      )}
      <button className={`sf-ask-ic${listening ? ' rec' : ''}`} onClick={voice} title="Speak" aria-label="Voice">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
      </button>
      <button className="sf-ask-send" onClick={go} disabled={busy || (!text.trim() && !file)} aria-label="Send">{busy ? '…' : file ? 'Create' : 'Ask AI'}</button>
    </div>
  )
}
