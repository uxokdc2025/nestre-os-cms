'use client'

import React, { useState } from 'react'

// Contact NESTRE App Support form (/nestre-app/help). Posts JSON to
// /api/app-support, which emails app-support@nestreperformance.com and sends the
// submitter a confirmation. Reuses the site's consult-field form styling so it
// looks and behaves like the booking/Work-With-Us forms.
export function AppSupportForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries())
    setState('sending')
    try {
      const r = await fetch('/api/app-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setState(r.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="consult-done" style={{ marginTop: 8 }}>
        <p className="consult-eyebrow">Message sent</p>
        <h3 className="consult-title" style={{ marginTop: 4 }}>We got your message.</h3>
        <p className="consult-sub">NESTRE app support will get back to you at the email you provided. We've sent you a confirmation too.</p>
      </div>
    )
  }

  return (
    <form className="app-support-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid-2">
        <label className="consult-field"><span>First name</span>
          <input name="firstName" type="text" required placeholder="First name" autoComplete="given-name" />
        </label>
        <label className="consult-field"><span>Last name</span>
          <input name="lastName" type="text" placeholder="Last name" autoComplete="family-name" />
        </label>
      </div>
      <label className="consult-field"><span>Username / account email</span>
        <input name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
      </label>
      <div className="form-grid-2">
        <label className="consult-field"><span>Device type</span>
          <select name="deviceType" defaultValue="">
            <option value="" disabled>Select…</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
          </select>
        </label>
        <label className="consult-field"><span>Specific device</span>
          <input name="specificDevice" type="text" placeholder="e.g. iPhone 15 Pro" />
        </label>
      </div>
      <div className="form-grid-2">
        <label className="consult-field"><span>Date of issue</span>
          <input name="dateOfIssue" type="text" inputMode="numeric" placeholder="MM/DD/YYYY" />
        </label>
        <label className="consult-field"><span>Time of issue</span>
          <input name="timeOfIssue" type="text" placeholder="HH:MM am/pm" />
        </label>
      </div>
      <label className="consult-field"><span>Description of your inquiry</span>
        <textarea name="description" rows={4} required placeholder="Please give a brief description of your inquiry…" />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="consult-hp" />
      <button type="submit" className="btn aqua consult-send" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Submit'}
      </button>
      {state === 'error' && <p className="consult-err">Something went wrong. Email us at app-support@nestreperformance.com.</p>}
    </form>
  )
}
