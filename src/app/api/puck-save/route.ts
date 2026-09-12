import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const { slug, data } = await req.json()
  if (!slug || !data?.content) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Puck content -> Payload blocks (drop puck id + the mirrored blockType)
  const layout = data.content.map((c: any) => {
    const { id, blockType, ...rest } = c.props || {}
    void id
    void blockType
    return { blockType: c.type, ...rest }
  })

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, draft: true })
  const page = res.docs[0] as any
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 })

  try {
    await payload.update({ collection: 'pages', id: page.id, data: { layout } as any })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'validation_failed', detail: String(e) }, { status: 422 })
  }
}
