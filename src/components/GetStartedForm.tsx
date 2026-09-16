'use client'

import { useState } from 'react'

const LOCATIONS = ['Lake Nona, FL', 'Winter Park, FL', 'Monterey, CA']

// Landing-page booking form. Posts to /api/consult (same route as the header
// popover) which emails the request to clayton@nestreperformance.com. No booking
// state is stored here — it's a lead hand-off to the NESTRE scheduler.
export function GetStartedForm({ defaultLocation }: { defaultLocation?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setStatus('sending')
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          location: fd.get('location'),
          date: fd.get('date'),
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
        <p className="eyebrow" style={{ color: 'var(--aqua)' }}>Request received</p>
        <h3 style={{ marginTop: 10 }}>We&rsquo;ll be in touch shortly.</h3>
        <p className="muted" style={{ marginTop: 10 }}>
          A NESTRE Scheduler will reach out to confirm your consultation. Prefer to talk now?
          Call <a href="tel:+16897103260">(689) 710-3260</a>.
        </p>
      </div>
    )
  }

  return (
    <form className="get-form" onSubmit={onSubmit} noValidate>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="get-hp" />
      <div className="get-form-row">
        <label>First Name<input name="firstName" autoComplete="given-name" required /></label>
        <label>Last Name<input name="lastName" autoComplete="family-name" required /></label>
      </div>
      <div className="get-form-row">
        <label>Email Address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Mobile Phone Number<input name="phone" type="tel" autoComplete="tel" required /></label>
      </div>
      <div className="get-form-row">
        <label>Preferred Location
          <select name="location" defaultValue={defaultLocation && LOCATIONS.includes(defaultLocation) ? defaultLocation : ''}>
            <option value="" disabled>Preferred Location</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label>Preferred Date<input name="date" type="date" /></label>
      </div>
      <label>What would you like to train the most?<textarea name="message" rows={4} /></label>
      <button className="btn aqua get-form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Schedule my consultation'}
      </button>
      {status === 'error' && (
        <p className="muted" style={{ color: '#ffb4b4', marginTop: 10 }} role="alert">
          Something went wrong. Please call <a href="tel:+16897103260">(689) 710-3260</a>.
        </p>
      )}
      <details className="faq-item get-consent">
        <summary>Consultation Consent &amp; Disclaimer</summary>
        <p className="muted">
          By scheduling a NESTRE Consultation, you acknowledge that this consultation is intended to
          evaluate cognitive performance, establish a baseline of mind and brain function, and provide
          personalized training recommendations. You understand that NESTRE&rsquo;s services are
          educational and performance-focused and are not intended to diagnose, treat, cure, or prevent
          any medical, neurological, or mental health condition, nor do they replace the advice or care
          of a licensed healthcare provider and should not be used to treat or diagnose any medical
          conditions. Participation in any assessment or training is voluntary, and you are responsible
          for informing NESTRE of any medical conditions, injuries, implanted medical devices, or other
          circumstances that may affect your participation prior to your consultation. Recommendations
          provided during your consultation are based on the information collected during your
          consultation and are intended solely for your personal use and performance development. By
          proceeding with your booking, you voluntarily assume responsibility for your participation,
          release NESTRE and its affiliates from liability to the fullest extent permitted by applicable
          law for claims arising from your voluntary participation and acknowledge that individual
          experiences and outcomes will vary and cannot be guaranteed.
        </p>
      </details>
    </form>
  )
}
