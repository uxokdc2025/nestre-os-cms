import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getByToken } from '@/lib/onboarding'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'

/** Email a user their onboarding link via Resend. POST { token }. Auth required.
 *  If Resend isn't configured, returns email_not_configured + the link to copy. */
export async function POST(req: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { token } = await req.json()
  const row = await getByToken(token)
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const url = `${SITE_URL}/welcome/${token}`

  const key = process.env.RESEND_API_KEY
  const from = process.env.ONBOARDING_FROM || 'NESTRE <onboarding@nestreperformance.com>'
  if (!key || !row.email) return NextResponse.json({ error: 'email_not_configured', url })

  const first = (row.name || '').split(' ')[0]
  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#10212a">
    <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;color:#6bbdb9;font-weight:600">NESTRE</p>
    <h1 style="font-size:24px;font-weight:600">Welcome${first ? `, ${first}` : ''}.</h1>
    <p style="font-size:15px;line-height:1.6;color:#384a51">You’ve been added to the NESTRE team. Take two minutes to tell us who you are and how you work — you can <b>speak, screenshot, or type</b> your answers.</p>
    <p style="margin:26px 0"><a href="${url}" style="background:#98d6d3;color:#081c26;text-decoration:none;font-weight:600;padding:13px 26px;border-radius:999px;display:inline-block">Start your onboarding →</a></p>
    <p style="font-size:13px;color:#52666d">Or paste this link: ${url}</p>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: row.email, subject: 'Welcome to NESTRE — a quick intro', html }),
      signal: AbortSignal.timeout(12000),
    })
    // Any Resend rejection (invalid key, unverified domain) → fall back to copy-link UX.
    if (!r.ok) return NextResponse.json({ error: 'email_not_configured', detail: await r.text().catch(() => ''), url })
    return NextResponse.json({ ok: true, message: `Onboarding email sent to ${row.email}` })
  } catch {
    return NextResponse.json({ error: 'email_not_configured', url })
  }
}
