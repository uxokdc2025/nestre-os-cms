import { NextResponse } from 'next/server'
import { getByToken } from '@/lib/onboarding'

export const runtime = 'nodejs'

// Sign a Supabase upload for an onboarding screenshot. Token-gated (the link is
// the credential); the browser PUTs the file straight to storage.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await getByToken(token)
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const { filename = 'upload' } = await req.json().catch(() => ({}))
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const secret = process.env.SUPABASE_SECRET_KEY!
  const safe = String(filename).toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').slice(-50)
  const name = `onboarding/${token.slice(0, 8)}-${Date.now()}-${safe}`
  try {
    const r = await fetch(`${url}/storage/v1/object/upload/sign/media/${name}`, {
      method: 'POST', headers: { apikey: secret, Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(9000),
    })
    if (!r.ok) return NextResponse.json({ error: 'sign_failed' }, { status: 502 })
    const { url: signed } = await r.json()
    return NextResponse.json({ uploadUrl: `${url}/storage/v1${signed}`, publicUrl: `${url}/storage/v1/object/public/media/${name}` })
  } catch (e) {
    return NextResponse.json({ error: 'sign_error', detail: String(e) }, { status: 502 })
  }
}
