import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

/** Create a signed direct-upload URL so the browser uploads straight to Supabase
 *  Storage (the server-side adapter hangs on large uploads). POST { filename }. */
export async function POST(req: Request) {
  const { filename = 'image', key = null } = await req.json()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const secret = process.env.SUPABASE_SECRET_KEY!
  // `key` overwrites an existing object (replace-in-place); otherwise a new unique name.
  const safe = String(filename).toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').slice(-60)
  const name = key ? String(key).replace(/[^a-z0-9._-]/gi, '-') : `${Date.now()}-${safe}`

  try {
    const r = await fetch(`${url}/storage/v1/object/upload/sign/media/${name}`, {
      method: 'POST', headers: { apikey: secret, Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(9000),
    })
    if (!r.ok) return NextResponse.json({ error: 'sign_failed', status: r.status }, { status: 502 })
    const { url: signed } = await r.json()
    return NextResponse.json({ uploadUrl: `${url}/storage/v1${signed}`, filename: name, publicUrl: `/api/media/file/${name}` })
  } catch (e) {
    return NextResponse.json({ error: 'sign_error', detail: String(e) }, { status: 502 })
  }
}
