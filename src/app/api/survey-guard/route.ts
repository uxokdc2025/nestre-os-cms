import { NextResponse } from 'next/server'
import { MIN_FILL_MS, stampAge, turnstileEnabled, verifyTurnstile } from '@/lib/survey-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Gate for the discovery-call quiz submit (see lib/survey-guard.ts). The guard
// script injected into the quiz calls this right before LeadConnector's submit
// request and only lets that request go out on { ok: true }.
// POST { hp: string, stamp: string, token: string | null }
export async function POST(req: Request) {
  let body: any // eslint-disable-line @typescript-eslint/no-explicit-any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 }) }

  // 1. Honeypot: any value at all means a bot filled every field it found.
  if (String(body?.hp ?? '').trim()) return NextResponse.json({ ok: false, reason: 'honeypot' }, { status: 403 })

  // 2. Time to submit, measured from the server-signed stamp on the quiz page.
  const age = stampAge(body?.stamp)
  if (age === null) return NextResponse.json({ ok: false, reason: 'stamp' }, { status: 403 })
  if (age < MIN_FILL_MS) return NextResponse.json({ ok: false, reason: 'too_fast' }, { status: 403 })

  // 3. Turnstile (only once both keys are configured).
  if (turnstileEnabled()) {
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const ok = await verifyTurnstile(body?.token, ip)
    // Cloudflare itself unreachable: don't lose a real lead over it; the honeypot
    // and timing checks above still held.
    if (ok === false) return NextResponse.json({ ok: false, reason: 'turnstile' }, { status: 403 })
  }

  return NextResponse.json({ ok: true, turnstile: turnstileEnabled() })
}
