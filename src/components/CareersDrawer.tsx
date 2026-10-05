'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Careers "general interest" form. Opens a right-side drawer on desktop and a
// full overlay on mobile (portaled to <body>, closes on backdrop / Esc), matching
// the Book-a-Consultation / Work-With-Us interaction. Inline, per-field error
// handling (design-system style) — no generic bottom-of-form error. Submits
// multipart to /api/careers, which emails the submission with the résumé attached.

const AREAS = [
  'Neuro Strength Trainer / Technician',
  'Client Experience & Operations',
  'Business Development & Partnerships',
  'Marketing & Communications',
  'Technology & Data',
  'Internships & Early Career',
  'Other',
]
const WORK_PREFERENCE = ['On-site', 'Hybrid', 'Remote', 'No preference']
const AVAILABILITY = ['Immediately', 'Within 2 weeks', 'Within 1 month', '1–3 months', 'Flexible']
const OPPORTUNITY = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Flexible']

type Errors = Partial<Record<
  'firstName' | 'lastName' | 'email' | 'location' | 'areas' | 'workPreference' | 'summary' | 'consent',
  string
>>

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)

export function CareersDrawer({ label = 'Submit your interest', className = 'btn aqua' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [fileName, setFileName] = useState('')
  const [mounted, setMounted] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const clear = (k: keyof Errors) => () => setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p))

  function validate(fd: FormData): Errors {
    const v = (k: string) => String(fd.get(k) || '').trim()
    const e: Errors = {}
    if (!v('firstName')) e.firstName = 'Enter your first name.'
    if (!v('lastName')) e.lastName = 'Enter your last name.'
    if (!v('email')) e.email = 'Enter your email address.'
    else if (!isEmail(v('email'))) e.email = 'Enter a valid email address.'
    if (!v('location')) e.location = 'Enter your city and state/province.'
    if (fd.getAll('areas').length === 0) e.areas = 'Select at least one area of interest.'
    if (!v('workPreference')) e.workPreference = 'Select a work preference.'
    if (!v('summary')) e.summary = 'Tell us a bit about your interests.'
    if (!(fd.get('consent') === 'on')) e.consent = 'Please acknowledge and consent to continue.'
    return e
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const errs = validate(fd)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const order = ['firstName', 'lastName', 'email', 'location', 'areas', 'workPreference', 'summary', 'consent'] as const
      const first = order.find((k) => errs[k])
      const el = first && formEl.querySelector<HTMLElement>(`[name="${first}"],[data-err="${first}"]`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      ;(el as HTMLInputElement | null)?.focus?.()
      return
    }
    setState('sending')
    try {
      const r = await fetch('/api/careers', { method: 'POST', body: fd })
      setState(r.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  const panel = (
    <>
      <div className="wwu-backdrop" aria-hidden onClick={() => setOpen(false)} />
      <div className="wwu-pop careers-pop" role="dialog" aria-modal="true" aria-label="Careers interest form">
        <button type="button" className="consult-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>

        {state === 'sent' ? (
          <div className="consult-done">
            <p className="consult-eyebrow">Thank you</p>
            <h3>Interest received.</h3>
            <p className="consult-sub">
              Thanks for your interest in NESTRE. Our Talent Acquisition team will review your
              information and reach out as opportunities become available.
            </p>
            <button type="button" className="btn ink" onClick={() => setOpen(false)}>Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="consult-eyebrow">Careers at NESTRE</p>
            <h3 className="consult-title" style={{ marginBottom: 8 }}>Build human performance with us.</h3>
            <p className="consult-sub" style={{ marginTop: 0, marginBottom: 14 }}>
              Interested in joining NESTRE? Share your background and career interests. Our Talent
              Acquisition team will review your information as opportunities become available.
            </p>
            <p className="careers-note" style={{ marginBottom: 16 }}>
              This form is for general career interest and is not an application for a specific position.
              Please do not include medical information, Social Security numbers, financial information, or
              other sensitive personal data. <span className="careers-req">* Required fields</span>
            </p>

            <p className="careers-group">Contact information</p>
            <div className="form-grid-2">
              <label className={`consult-field${errors.firstName ? ' has-err' : ''}`}><span>First name *</span>
                <input name="firstName" type="text" autoComplete="given-name" aria-invalid={!!errors.firstName} onInput={clear('firstName')} />
                {errors.firstName && <span className="field-err">{errors.firstName}</span>}
              </label>
              <label className={`consult-field${errors.lastName ? ' has-err' : ''}`}><span>Last name *</span>
                <input name="lastName" type="text" autoComplete="family-name" aria-invalid={!!errors.lastName} onInput={clear('lastName')} />
                {errors.lastName && <span className="field-err">{errors.lastName}</span>}
              </label>
            </div>
            <div className="form-grid-2">
              <label className={`consult-field${errors.email ? ' has-err' : ''}`}><span>Email address *</span>
                <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} onInput={clear('email')} />
                {errors.email && <span className="field-err">{errors.email}</span>}
              </label>
              <label className="consult-field"><span>Phone number</span>
                <input name="phone" type="tel" autoComplete="tel" />
              </label>
            </div>
            <label className={`consult-field${errors.location ? ' has-err' : ''}`}><span>City and state/province *</span>
              <input name="location" type="text" placeholder="Example: Orlando, Florida" aria-invalid={!!errors.location} onInput={clear('location')} />
              {errors.location && <span className="field-err">{errors.location}</span>}
            </label>

            <p className="careers-group">Career interests</p>
            <div className={`careers-checks${errors.areas ? ' has-err' : ''}`} data-err="areas">
              <span className="consult-field-lab">Area(s) of interest * <em>Select all that apply.</em></span>
              <div className="careers-check-grid">
                {AREAS.map((a) => (
                  <label key={a} className="careers-check">
                    <input type="checkbox" name="areas" value={a} onChange={clear('areas')} />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
              {errors.areas && <span className="field-err">{errors.areas}</span>}
            </div>
            <div className="form-grid-2">
              <label className={`consult-field${errors.workPreference ? ' has-err' : ''}`}><span>Work preference *</span>
                <select name="workPreference" defaultValue="" aria-invalid={!!errors.workPreference} onChange={clear('workPreference')}>
                  <option value="" disabled>Select one</option>
                  {WORK_PREFERENCE.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.workPreference && <span className="field-err">{errors.workPreference}</span>}
              </label>
              <label className="consult-field"><span>Availability to begin</span>
                <select name="availability" defaultValue="">
                  <option value="" disabled>Select one</option>
                  {AVAILABILITY.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            </div>
            <div className="form-grid-2">
              <label className="consult-field"><span>Opportunity type</span>
                <select name="opportunityType" defaultValue="">
                  <option value="" disabled>Select one</option>
                  {OPPORTUNITY.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label className="consult-field"><span>How did you hear about us?</span>
                <input name="howHeard" type="text" placeholder="LinkedIn, referral, event…" />
              </label>
            </div>

            <p className="careers-group">Professional background</p>
            <label className="consult-field"><span>LinkedIn profile or professional portfolio</span>
              <input name="linkedin" type="url" placeholder="https://" />
            </label>
            <div className="consult-field">
              <span>Résumé / CV</span>
              <input
                ref={fileRef}
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="wwu-file-input"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
              <button type="button" className="wwu-file-btn" onClick={() => fileRef.current?.click()}>
                {fileName || 'Choose a file (PDF, DOC or DOCX)'}
              </button>
              <span className="careers-hint">Accepted: PDF, DOC, DOCX · max 10 MB.</span>
            </div>
            <label className={`consult-field${errors.summary ? ' has-err' : ''}`}><span>Tell us about your interests and the value you could bring to NESTRE *</span>
              <textarea name="summary" rows={4} maxLength={1500} placeholder="Share a brief summary of your experience, interests, and the type of opportunity you are seeking." aria-invalid={!!errors.summary} onInput={clear('summary')} />
              {errors.summary && <span className="field-err">{errors.summary}</span>}
            </label>

            <p className="careers-group">Acknowledgment &amp; consent</p>
            <label className={`careers-consent${errors.consent ? ' has-err' : ''}`} data-err="consent">
              <input type="checkbox" name="consent" onChange={clear('consent')} />
              <span>
                I authorize NESTRE to use the information I provide to contact me about current or future
                career opportunities. I understand this does not create an employment relationship,
                guarantee consideration, or constitute an application for a specific opening. *
              </span>
            </label>
            {errors.consent && <span className="field-err" style={{ display: 'block', marginTop: 2 }}>{errors.consent}</span>}

            {/* honeypot */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="consult-hp" />
            <button type="submit" className="btn aqua consult-send" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Submit interest'}
            </button>
            {state === 'error' && (
              <p className="field-err" role="alert" style={{ textAlign: 'center', marginTop: 4 }}>
                Something went wrong sending your interest. Please try again in a moment.
              </p>
            )}
            <p className="careers-fine">
              NESTRE is an equal opportunity employer and considers qualified candidates without unlawful discrimination.
            </p>
          </form>
        )}
      </div>
    </>
  )

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setOpen(true); setState('idle'); setErrors({}) }}>
        {label}
      </button>
      {open && mounted && createPortal(panel, document.body)}
    </>
  )
}
