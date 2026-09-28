'use client'

import React, { useState } from 'react'

// Get-started "questions about the consultation" form (Neuro Lab / Facebook-ad
// landing pages). Posts to /api/neurolab-consult, which emails the request to
// neurolabs@nestreperformance.com. It does NOT book — on success it confirms and
// points to the main site. Lead hand-off only; nothing is stored here.
export function GetStartedForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const fd = new FormData(e.currentTarget)
    setStatus('sending')
    try {
      const res = await fetch('/api/neurolab-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          message: fd.get('message'),
          company: fd.get('company'), // honeypot
        }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="get-form-done" role="status">
        <p className="eyebrow" style={{ color: 'var(--aqua-ink)' }}>Message sent</p>
        <h3 style={{ marginTop: 10 }}>Thanks — we&rsquo;ll be in touch.</h3>
        <p className="muted" style={{ marginTop: 10 }}>Our team will reach out to you within 24&ndash;48 hours.</p>
        <p className="muted" style={{ marginTop: 20, fontWeight: 600, color: 'var(--ink)' }}>For more information about NESTRE&hellip;</p>
        <a className="btn aqua" style={{ marginTop: 12 }} href="https://nestreperformance.com">Explore NESTRE</a>
      </div>
    )
  }

  return (
    <form className="get-form" onSubmit={onSubmit} noValidate>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="get-hp" />
      <div className="get-form-row">
        <label>First name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required /></label>
      </div>
      <div className="get-form-row">
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
      </div>
      <label>What would you like to know?
        <textarea name="message" rows={4} required placeholder="Tell us what's on your mind about the consultation." />
      </label>
      <button className="btn ink get-form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Ask Our Team →'}
      </button>
      <p className="get-form-note muted">Our team will reach out to you within 24&ndash;48 hours.</p>
      {status === 'error' && (
        <p className="muted" style={{ color: '#c0392b', marginTop: 4 }} role="alert">
          Something went wrong. Please call <a href="tel:+16897103260">(689) 710-3260</a>.
        </p>
      )}
    </form>
  )
}
