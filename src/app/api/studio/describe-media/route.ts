import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const maxDuration = 45

/** Generate accessible alt text for a media item with Claude vision, and save it.
 *  POST { id }. */
export async function POST(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const media = await payload.findByID({ collection: 'media', id, depth: 0 }).catch(() => null) as any // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!media) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicUrl = `${base}/storage/v1/object/public/media/${media.filename}`
  let b64 = '', mime = media.mimeType || 'image/jpeg'
  try {
    const r = await fetch(publicUrl, { signal: AbortSignal.timeout(9000) })
    if (!r.ok) throw new Error(`fetch ${r.status}`)
    mime = r.headers.get('content-type') || mime
    b64 = Buffer.from(await r.arrayBuffer()).toString('base64')
  } catch (e) {
    return NextResponse.json({ error: 'image_fetch_failed', detail: String(e) }, { status: 502 })
  }
  if (!mime.startsWith('image/')) return NextResponse.json({ error: 'not an image' }, { status: 400 })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let alt = ''
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 120,
      system: 'Write concise, descriptive alt text (max ~120 chars) for this image on the NESTRE cognitive-performance website. Return ONLY the alt text, no quotes, no prefix.',
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mime as any, data: b64 } }] as any }], // eslint-disable-line @typescript-eslint/no-explicit-any
    })
    alt = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('').trim().replace(/^["']|["']$/g, '') // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    return NextResponse.json({ error: 'ai_failed', detail: String(e) }, { status: 502 })
  }

  try {
    await payload.update({ collection: 'media', id, data: { alt } })
    return NextResponse.json({ ok: true, alt })
  } catch (e) {
    return NextResponse.json({ error: 'save_failed', detail: String(e) }, { status: 422 })
  }
}
