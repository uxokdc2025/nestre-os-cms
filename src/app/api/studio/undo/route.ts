import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { popLatest, historyCount } from '@/lib/history'

export const runtime = 'nodejs'

/** GET → { count } restore points. POST → undo the last change on { slug }. Auth required. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug') || 'home'
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  return NextResponse.json({ count: await historyCount(payload, slug) })
}

export async function POST(req: Request) {
  const { slug = 'home' } = await req.json()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const layout = await popLatest(payload, slug)
  if (layout == null) return NextResponse.json({ error: 'Nothing to undo.' }, { status: 404 })

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1 })
  const page = res.docs[0] as any
  if (!page) return NextResponse.json({ error: 'page not found' }, { status: 404 })

  try {
    await payload.update({ collection: 'pages', id: page.id, data: { layout } as any })
    return NextResponse.json({ ok: true, message: 'Reverted last change.', count: await historyCount(payload, slug) })
  } catch (e) {
    return NextResponse.json({ error: 'undo_failed', detail: String(e) }, { status: 422 })
  }
}
