'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// "Work With Us" careers form — a footer link that opens a right-side slide-in
// panel (portaled to <body>, closes on backdrop / Esc), mirroring the Book a
// Consultation interaction. Fields: name, email, résumé (file). Submits multipart
// to /api/work-with-us, which emails Clayton with the résumé attached.
export function WorkWithUsPopover({ label = 'Work With Us', className = 'footer-link-btn' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [mounted, setMounted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState('sending')
    try {
      const data = new FormData(e.currentTarget)
      const r = await fetch('/api/work-with-us', { method: 'POST', body: data })
      setState(r.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }

  const panel = (
    <>
      <div className="wwu-backdrop" aria-hidden onClick={() => setOpen(false)} />
      <div className="wwu-pop" role="dialog" aria-modal="true" aria-label="Work With Us">
        <button type="button" className="consult-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        {state === 'sent' ? (
          <div className="consult-done">
            <p className="consult-eyebrow">Thank you</p>
            <h3>Application received.</h3>
            <p className="consult-sub">Thanks for your interest in NESTRE — our team will review your résumé and be in touch.</p>
            <button type="button" className="btn ink" onClick={() => setOpen(false)}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="consult-eyebrow">Work With Us</p>
            <h3 className="consult-title">Join the NESTRE team.</h3>
            <p className="consult-sub" style={{ marginTop: -8, marginBottom: 16 }}>Tell us about yourself and attach your résumé.</p>
            <label className="consult-field"><span>Your name</span>
              <input name="name" type="text" required placeholder="Full name" autoComplete="name" />
            </label>
            <label className="consult-field"><span>Your e-mail</span>
              <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="consult-field"><span>A note (optional)</span>
              <textarea name="message" rows={2} placeholder="What role or team interests you?" />
            </label>
            <div className="consult-field">
              <span>Résumé</span>
              <input
                ref={fileRef}
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="wwu-file-input"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
              <button type="button" className="wwu-file-btn" onClick={() => fileRef.current?.click()}>
                {fileName ? fileName : 'Choose a file (PDF or Word)'}
              </button>
            </div>
            {/* honeypot — hidden from humans */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="consult-hp" />
            <button type="submit" className="btn aqua consult-send" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Submit application'}
            </button>
            {state === 'error' && <p className="consult-err">Something went wrong. Email us at info@nestreperformance.com.</p>}
          </form>
        )}
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen(true); setState('idle') }}
      >
        {label}
      </button>
      {open && mounted && createPortal(panel, document.body)}
    </>
  )
}
