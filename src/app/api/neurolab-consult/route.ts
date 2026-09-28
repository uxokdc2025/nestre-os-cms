import { NextRequest, NextResponse } from 'next/server'

// Get-started "Request A Consultation" form (Neuro Lab landing pages). Emails the
// request to neurolabs@nestreperformance.com via Resend, reply-to the submitter.
// Fixed recipient server-side (no client-supplied destination) — same Resend
// style as /api/consult. Lead hand-off only; nothing is stored.

const esc = (s: string) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Honeypot — bots fill the hidden field; humans never see it.
  if (body.company) return NextResponse.json({ ok: true })

  const firstName = (body.firstName || '').trim()
  const lastName = (body.lastName || '').trim()
  const email = (body.email || '').trim()
  const phone = (body.phone || '').trim()
  const location = (body.location || '').trim()
  const date = (body.date || '').trim()
  const message = (body.message || '').trim()

  if (!firstName || !email) return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'bad_email' }, { status: 422 })

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONSULT_FROM || process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  const to = process.env.NEUROLAB_CONSULT_TO || 'neurolabs@nestreperformance.com'
  if (!key) return NextResponse.json({ error: 'email_not_configured' }, { status: 503 })

  const name = `${firstName} ${lastName}`.trim()
  const row = (label: string, value: string) =>
    value ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d;white-space:nowrap">${label}</td><td>${esc(value)}</td></tr>` : ''

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · Consultation request</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 18px">${esc(name || 'A NESTRE lead')} wants a consultation.</h1>
    <table style="font-size:15px;line-height:1.6;color:#384a51;border-collapse:collapse">
      ${row('Name', name)}
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d">Phone</td><td><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>` : ''}
      ${row('Preferred location', location)}
      ${row('Preferred date', date)}
    </table>
    ${message ? `<p style="font-size:15px;line-height:1.7;color:#10212a;margin-top:18px;white-space:pre-wrap;border-left:3px solid #98d6d3;padding-left:14px">${esc(message)}</p>` : ''}
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: email, subject: `Consultation request — ${name || email}`, html }),
      signal: AbortSignal.timeout(12000),
    })
    if (!r.ok) return NextResponse.json({ error: 'send_failed', detail: await r.text().catch(() => '') }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'send_error' }, { status: 502 })
  }
}
