'use client'

import React, { useState } from 'react'

// Get-started "questions about the consultation" form (Neuro Lab / Facebook-ad
// landing pages). Posts to /api/neurolab-consult, which emails the request to
// neurolabs@nestreperformance.com. It does NOT book — on success it confirms and
// points to the main site. Validates inline so a blank/invalid form never hits
// the server (which is what surfaced the generic "something went wrong").
type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'message', string>>

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)

export function GetStartedForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})

  function validate(fd: FormData): Errors {
    const g = (k: string) => (fd.get(k) as string | null)?.trim() || ''
    const e: Errors = {}
    if (!g('firstName')) e.firstName = 'Enter your first name.'
    if (!g('lastName')) e.lastName = 'Enter your last name.'
    if (!g('email')) e.email = 'Enter your email address.'
    else if (!isEmail(g('email'))) e.email = 'Enter a valid email address.'
    if (!g('phone')) e.phone = 'Enter your phone number.'
    if (!g('message')) e.message = 'Let us know what you’d like to ask.'
    return e
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'sending') return
    const form = e.currentTarget
    const fd = new FormData(form)
    const errs = validate(fd)
    setErrors(errs)
    if (Object.keys(errs).length) {
      // focus the first invalid field
      const first = (['firstName', 'lastName', 'email', 'phone', 'message'] as const).find((k) => errs[k])
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }
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

  // Clear a field's error as soon as the visitor edits it.
  const clear = (k: keyof Errors) => () => setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p))

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
        <label className={errors.firstName ? 'has-err' : undefined}>First name
          <input name="firstName" autoComplete="given-name" aria-invalid={!!errors.firstName} onInput={clear('firstName')} />
          {errors.firstName && <span className="field-err">{errors.firstName}</span>}
        </label>
        <label className={errors.lastName ? 'has-err' : undefined}>Last name
          <input name="lastName" autoComplete="family-name" aria-invalid={!!errors.lastName} onInput={clear('lastName')} />
          {errors.lastName && <span className="field-err">{errors.lastName}</span>}
        </label>
      </div>
      <div className="get-form-row">
        <label className={errors.email ? 'has-err' : undefined}>Email address
          <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} onInput={clear('email')} />
          {errors.email && <span className="field-err">{errors.email}</span>}
        </label>
        <label className={errors.phone ? 'has-err' : undefined}>Phone number
          <input name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} onInput={clear('phone')} />
          {errors.phone && <span className="field-err">{errors.phone}</span>}
        </label>
      </div>
      <label className={errors.message ? 'has-err' : undefined}>What would you like to know?
        <textarea name="message" rows={4} placeholder="Tell us what's on your mind about the consultation." aria-invalid={!!errors.message} onInput={clear('message')} />
        {errors.message && <span className="field-err">{errors.message}</span>}
      </label>
      <button className="btn aqua get-form-submit" type="submit" disabled={status === 'sending'}>
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
