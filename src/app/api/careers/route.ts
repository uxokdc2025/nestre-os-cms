import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// Careers "general interest" form (/careers drawer). Multipart form-data with the
// contact, interest, background and consent fields + an optional résumé file.
// Emails the submission — résumé attached — to CAREERS_INTEREST_TO via Resend,
// reply-to the applicant. On staging this points at designer@uxokdc.com; set the
// env to eduardo@nestreperformance.com for production.
const esc = (s: string) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  if (String(form.get('company') || '').trim()) return NextResponse.json({ ok: true }) // honeypot

  const g = (k: string, max = 400) => String(form.get(k) || '').trim().slice(0, max)
  const firstName = g('firstName', 80)
  const lastName = g('lastName', 80)
  const email = g('email', 160)
  const phone = g('phone', 60)
  const location = g('location', 160)
  const areas = form.getAll('areas').map((a) => String(a).slice(0, 80)).filter(Boolean)
  const workPreference = g('workPreference', 60)
  const availability = g('availability', 60)
  const opportunityType = g('opportunityType', 60)
  const howHeard = g('howHeard', 160)
  const linkedin = g('linkedin', 300)
  const summary = g('summary', 1500)
  const consent = form.get('consent') === 'on' || form.get('consent') === 'true'

  // Server-side guard mirroring the inline validation.
  if (!firstName || !lastName || !location || !summary || !consent) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'bad_email' }, { status: 422 })
  }
  if (!areas.length) {
    return NextResponse.json({ error: 'no_area' }, { status: 422 })
  }

  const attachments: { filename: string; content: string }[] = []
  const resume = form.get('resume')
  if (resume && typeof resume === 'object' && 'arrayBuffer' in resume) {
    const file = resume as File
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large' }, { status: 413 })
    if (file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer())
      attachments.push({ filename: file.name || 'resume', content: buf.toString('base64') })
    }
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONSULT_FROM || process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  const to = process.env.CAREERS_INTEREST_TO || 'designer@uxokdc.com'
  if (!key) return NextResponse.json({ error: 'email_not_configured' }, { status: 503 })

  const name = `${firstName} ${lastName}`.trim()
  const row = (label: string, value: string) =>
    value ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d;white-space:nowrap;vertical-align:top">${label}</td><td>${esc(value)}</td></tr>` : ''
  const resumeNote = attachments.length
    ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d">Résumé</td><td><b>${esc(attachments[0].filename)}</b> (attached)</td></tr>`
    : ''

  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · Careers interest</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 18px">${esc(name)} is interested in joining NESTRE.</h1>
    <table style="font-size:15px;line-height:1.6;color:#384a51;border-collapse:collapse">
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Name</td><td><b>${esc(name)}</b></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      ${row('Phone', phone)}
      ${row('Location', location)}
      ${row('Area(s) of interest', areas.join(', '))}
      ${row('Work preference', workPreference)}
      ${row('Availability', availability)}
      ${row('Opportunity type', opportunityType)}
      ${row('How they heard', howHeard)}
      ${linkedin ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d">LinkedIn / portfolio</td><td><a href="${esc(linkedin)}">${esc(linkedin)}</a></td></tr>` : ''}
      ${resumeNote}
    </table>
    <p style="font-size:15px;line-height:1.7;color:#10212a;margin-top:18px;white-space:pre-wrap;border-left:3px solid #98d6d3;padding-left:14px">${esc(summary)}</p>
    <p style="font-size:12px;color:#8a969b;margin-top:16px">Consent given: the applicant authorized NESTRE to contact them about current or future opportunities.</p>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: email, subject: `Careers interest — ${name}`, html, attachments }),
      signal: AbortSignal.timeout(20000),
    })
    if (!r.ok) return NextResponse.json({ error: 'send_failed', detail: await r.text().catch(() => '') }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'send_error' }, { status: 502 })
  }
}
