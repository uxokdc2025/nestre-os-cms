'use client'

import { useEffect, useRef, useState } from 'react'

// "Book a Consultation" button that opens a small dropdown form from the top-right.
// Submits to /api/consult, which emails the lead via Resend. Closes on Esc / outside click.
export function ConsultPopover({ label = 'Book a Consultation', className = 'btn aqua nav-cta' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onClick = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    try {
      const r = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'), email: f.get('email'), message: f.get('message'), company: f.get('company'),
        }),
      })
      setState(r.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }

  return (
    <div className="consult-wrap" ref={wrapRef}>
      <button type="button" className={className} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen((o) => !o); setState('idle') }}>
        <span className="cta-full">{label}</span>
        <span className="cta-short">Book now</span>
      </button>
      {open && (
        <div className="consult-pop" role="dialog" aria-label="Book a consultation">
          {state === 'sent' ? (
            <div className="consult-done">
              <p className="consult-eyebrow">Thank you</p>
              <h3>We&rsquo;ll be in touch.</h3>
              <p className="consult-sub">Your request is in — a NeuroTrainer will reach out shortly.</p>
              <button type="button" className="btn ink" onClick={() => setOpen(false)}>Close</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="consult-eyebrow">Book a Consultation</p>
              <h3 className="consult-title">Let&rsquo;s start the conversation.</h3>
              <label className="consult-field"><span>Your name</span>
                <input name="name" type="text" required placeholder="Full name" autoComplete="name" />
              </label>
              <label className="consult-field"><span>Your e-mail</span>
                <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
              </label>
              <label className="consult-field"><span>Message</span>
                <textarea name="message" required rows={3} placeholder="How can we help?" />
              </label>
              {/* honeypot — hidden from humans */}
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="consult-hp" />
              <button type="submit" className="btn aqua consult-send" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              {state === 'error' && <p className="consult-err">Something went wrong. Email us at info@nestreperformance.com.</p>}
            </form>
          )}
        </div>
      )}
    </div>
  )
}
