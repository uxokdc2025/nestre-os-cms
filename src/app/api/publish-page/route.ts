import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

/** Publish the current draft of a page live. POST { slug }. Auth required. */
export async function POST(req: Request) {
  const { slug = 'home' } = await req.json()
  const payload = await getPayload({ config: await config })

  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1, draft: false })
  const page = res.docs[0] as any
  if (!page) return NextResponse.json({ error: 'page not found' }, { status: 404 })

  try {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout: page.layout } as any,
    })
    return NextResponse.json({ ok: true, message: `Published "${slug}".` })
  } catch (e) {
    return NextResponse.json({ error: 'publish_failed', detail: String(e) }, { status: 422 })
  }
}
