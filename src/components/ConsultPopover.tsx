'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// "Book a Consultation" CTA that opens a form.
// - Desktop: a dropdown anchored under the button (absolute, closes on outside click / Esc).
// - Mobile (≤620px): a bottom drawer (sheet) portaled to <body> so it anchors to the
//   viewport, escaping the header's transformed containing block. Closes via backdrop / Esc.
// Submits to /api/consult, which emails the lead via Resend.
export function ConsultPopover({
  label = 'Book a Consultation',
  className = 'btn aqua nav-cta',
  wrapClassName = '',
  onOpen,
}: {
  label?: string
  className?: string
  wrapClassName?: string
  onOpen?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 620px)')
    const on = () => setIsMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    // desktop closes on outside click; mobile closes via the backdrop (the portaled
    // panel lives outside wrapRef, so this handler must not run there).
    const onClick = (e: MouseEvent) => { if (!isMobile && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open, isMobile])

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

  const panel = (
    <>
      <div className="consult-backdrop" aria-hidden onClick={() => setOpen(false)} />
      <div className="consult-pop" role="dialog" aria-modal="true" aria-label="Book a consultation">
        <button type="button" className="consult-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
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
    </>
  )

  return (
    <div className={`consult-wrap ${wrapClassName}`.trim()} ref={wrapRef}>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen((o) => { const next = !o; if (next) onOpen?.(); return next }); setState('idle') }}
      >
        <span className="cta-full">{label}</span>
        <span className="cta-short">Book now</span>
      </button>
      {open && (isMobile && mounted ? createPortal(panel, document.body) : panel)}
    </div>
  )
}
