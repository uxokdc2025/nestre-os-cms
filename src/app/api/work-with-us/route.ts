import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// "Work With Us" careers form (footer popover). Accepts multipart form-data:
// { name, email, resume (file), message?, company? }. `company` is a honeypot.
// Emails the application — with the résumé attached — to CAREERS_TO (Clayton) via
// Resend, reply-to set to the applicant.
export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const name = String(form.get('name') || '').trim().slice(0, 120)
  const email = String(form.get('email') || '').trim().slice(0, 160)
  const message = String(form.get('message') || '').trim().slice(0, 4000)
  const honeypot = String(form.get('company') || '').trim()
  const resume = form.get('resume')

  if (honeypot) return NextResponse.json({ ok: true }) // silently drop bots
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 })
  }

  const attachments: { filename: string; content: string }[] = []
  if (resume && typeof resume === 'object' && 'arrayBuffer' in resume) {
    const file = resume as File
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'file_too_large' }, { status: 413 })
    }
    if (file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer())
      attachments.push({ filename: file.name || 'resume', content: buf.toString('base64') })
    }
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONSULT_FROM || process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  const to = process.env.CAREERS_TO || 'clayton@nestreperformance.com'
  if (!key) return NextResponse.json({ error: 'email_not_configured' }, { status: 503 })

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))
  const resumeNote = attachments.length
    ? `<tr><td style="padding:4px 14px 4px 0;color:#52666d">Résumé</td><td><b>${esc(attachments[0].filename)}</b> (attached)</td></tr>`
    : `<tr><td style="padding:4px 14px 4px 0;color:#52666d">Résumé</td><td style="color:#8a969b">none attached</td></tr>`
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · Work With Us</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 18px">${esc(name)} wants to work with NESTRE.</h1>
    <table style="font-size:15px;line-height:1.6;color:#384a51;border-collapse:collapse">
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Name</td><td><b>${esc(name)}</b></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      ${resumeNote}
    </table>
    ${message ? `<p style="font-size:15px;line-height:1.7;color:#10212a;margin-top:18px;white-space:pre-wrap;border-left:3px solid #98d6d3;padding-left:14px">${esc(message)}</p>` : ''}
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: email, subject: `Work With Us — ${name}`, html, attachments }),
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) return NextResponse.json({ error: 'send_failed', detail: await r.text().catch(() => '') }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }
}
