import { NextRequest, NextResponse } from 'next/server'

// NESTRE app support form (/nestre-app/help). Emails the submission to
// app-support@nestreperformance.com via Resend, reply-to set to the submitter,
// and sends the submitter a branded "we got your message" confirmation — the
// same Resend + inline-HTML style used by /api/consult.

const esc = (s: string) => (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Honeypot — bots fill hidden fields; humans never see it.
  if (body.company) return NextResponse.json({ ok: true })

  const firstName = (body.firstName || '').trim()
  const lastName = (body.lastName || '').trim()
  const email = (body.email || '').trim()
  const deviceType = (body.deviceType || '').trim()
  const specificDevice = (body.specificDevice || '').trim()
  const dateOfIssue = (body.dateOfIssue || '').trim()
  const timeOfIssue = (body.timeOfIssue || '').trim()
  const description = (body.description || '').trim()

  if (!firstName || !email || !description) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'bad_email' }, { status: 422 })
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONSULT_FROM || process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  const to = process.env.APP_SUPPORT_TO || 'app-support@nestreperformance.com'
  if (!key) return NextResponse.json({ error: 'email_not_configured' }, { status: 503 })

  const name = `${firstName} ${lastName}`.trim()
  const row = (label: string, value: string) =>
    value ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d;white-space:nowrap">${label}</td><td>${esc(value)}</td></tr>` : ''

  const supportHtml = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · App support request</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 18px">${esc(name || 'A NESTRE app user')} needs help.</h1>
    <table style="font-size:15px;line-height:1.6;color:#384a51;border-collapse:collapse">
      ${row('Name', name)}
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      ${row('Device type', deviceType)}
      ${row('Specific device', specificDevice)}
      ${row('Date of issue', dateOfIssue)}
      ${row('Time of issue', timeOfIssue)}
    </table>
    <p style="font-size:15px;line-height:1.7;color:#10212a;margin-top:18px;white-space:pre-wrap;border-left:3px solid #98d6d3;padding-left:14px">${esc(description)}</p>
  </div>`

  const confirmHtml = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · App support</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 14px">We got your message.</h1>
    <p style="font-size:15px;line-height:1.7;color:#384a51">Thanks${firstName ? `, ${esc(firstName)}` : ''} — the NESTRE app support team has received your request and will get back to you at this email address as soon as we can.</p>
    <p style="font-size:15px;line-height:1.7;color:#384a51;margin-top:14px">For your records, here's what you sent:</p>
    <p style="font-size:15px;line-height:1.7;color:#10212a;margin-top:8px;white-space:pre-wrap;border-left:3px solid #98d6d3;padding-left:14px">${esc(description)}</p>
    <p style="font-size:13px;line-height:1.6;color:#7b8b91;margin-top:20px">If you didn't submit this, you can ignore this email.</p>
  </div>`

  const send = (payload: object) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    })

  try {
    const r = await send({ from, to, reply_to: email, subject: `App support — ${name || email}`, html: supportHtml })
    if (!r.ok) return NextResponse.json({ error: 'send_failed', detail: await r.text().catch(() => '') }, { status: 502 })
    // Confirmation to the submitter — best-effort; never fail the request on it.
    await send({ from, to: email, subject: 'We got your message — NESTRE App Support', html: confirmHtml }).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'send_error' }, { status: 502 })
  }
}
