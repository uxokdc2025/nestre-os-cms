import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Public contact form for the "Book a Consultation" popover. POST { name, email,
// message, company? }. `company` is a honeypot — bots fill it, humans don't.
// Emails the submission to CONSULT_TO via Resend, reply-to set to the submitter.
export async function POST(req: Request) {
  let body: any // eslint-disable-line @typescript-eslint/no-explicit-any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }

  const name = String(body?.name || '').trim().slice(0, 120)
  const email = String(body?.email || '').trim().slice(0, 160)
  const phone = String(body?.phone || '').trim().slice(0, 40)
  const clean = (v: unknown) => (Array.isArray(v) ? v : [v]).map((s) => String(s || '').trim()).filter(Boolean).slice(0, 7)
  const days = clean(body?.days)
  const times = clean(body?.times)
  const honeypot = String(body?.company || '').trim()

  if (honeypot) return NextResponse.json({ ok: true }) // silently drop bots
  if (!name || !phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 })
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONSULT_FROM || process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  const to = process.env.CONSULT_TO || 'clayton@nestreperformance.com'
  if (!key) return NextResponse.json({ error: 'email_not_configured' }, { status: 503 })

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE · Consultation request</p>
    <h1 style="font-size:22px;font-weight:600;margin:6px 0 18px">${esc(name)} wants to talk.</h1>
    <table style="font-size:15px;line-height:1.6;color:#384a51;border-collapse:collapse">
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Name</td><td><b>${esc(name)}</b></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Phone</td><td><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Days</td><td>${days.length ? esc(days.join(', ')) : '—'}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#52666d">Times</td><td>${times.length ? esc(times.join(', ')) : '—'}</td></tr>
    </table>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: email, subject: `Consultation request — ${name}`, html }),
      signal: AbortSignal.timeout(12000),
    })
    if (!r.ok) return NextResponse.json({ error: 'send_failed', detail: await r.text().catch(() => '') }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }
}
