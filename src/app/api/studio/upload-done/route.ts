import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

/** Register an already-uploaded object as a Payload media row. POST { filename,
 *  mime, size, width?, height?, alt? }. Writes via the pg pool to avoid the
 *  storage adapter's upload hook (which hangs). */
export async function POST(req: Request) {
  const { filename, mime = 'image/jpeg', size = 0, width = null, height = null, alt = '' } = await req.json()
  if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const pool = (payload as any).db?.pool // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const { rows } = await pool.query(
      `insert into cms.media (updated_at, created_at, url, filename, mime_type, filesize, width, height, alt)
       values (now(), now(), $1, $2, $3, $4, $5, $6, $7) returning id`,
      [`/api/media/file/${filename}`, filename, mime, size, width, height, alt || null],
    )
    return NextResponse.json({ ok: true, id: rows[0].id, filename, url: `/api/media/file/${filename}` })
  } catch (e) {
    return NextResponse.json({ error: 'register_failed', detail: String(e) }, { status: 422 })
  }
}
