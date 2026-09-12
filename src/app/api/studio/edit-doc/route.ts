import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'updated_at', 'created_at', 'sizes', 'filename', 'mimeType', 'filesize', 'width', 'height', 'url', 'thumbnailURL', 'focalX', 'focalY'])
const strip = (o: any) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => !SYSTEM_FIELDS.has(k))) // eslint-disable-line @typescript-eslint/no-explicit-any

/** Generic AI editor for any global or collection document (Nav, Footer, Brand,
 *  News item, Media, …). POST { scope:'global'|'collection', slug, id?, instruction }.
 *  Reads the current data, asks Haiku to apply the instruction, merges + saves. */
export async function POST(req: Request) {
  const { scope, slug, id = null, instruction } = await req.json()
  if (!instruction || !slug || !scope) return NextResponse.json({ error: 'scope, slug, instruction required' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // CREATE mode: collection + no id → AI generates a brand-new item.
  if (scope === 'collection' && !id) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const media = await payload.find({ collection: 'media', depth: 0, limit: 50 }).then((r) => r.docs.map((m: any) => ({ id: m.id, alt: m.alt, filename: m.filename }))).catch(() => []) // eslint-disable-line @typescript-eslint/no-explicit-any
    const sys = `You create one new "${slug}" item for the NESTRE website CMS from the user's instruction.
Return ONLY a JSON object of the fields. No prose, no fences. For a news item the fields are:
{ "title": string, "source": string, "date": ISO date string, "summary": string, "url": string, "published": boolean }.
Use a real URL only if the user gave one; otherwise set "url" to "" and "published" to false. Image fields take a media id from: ${JSON.stringify(media)}.`
    try {
      const msg = await anthropic.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 1500, system: sys, messages: [{ role: 'user', content: instruction }] })
      const raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('') // eslint-disable-line @typescript-eslint/no-explicit-any
      const data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
      const doc = await payload.create({ collection: slug, data: data as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ ok: true, created: true, id: (doc as any).id, message: 'Created ✓' }) // eslint-disable-line @typescript-eslint/no-explicit-any
    } catch (e) {
      return NextResponse.json({ error: 'create_failed', detail: String(e) }, { status: 422 })
    }
  }

  let current: any // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    current = scope === 'global'
      ? await payload.findGlobal({ slug, depth: 0 })
      : await payload.findByID({ collection: slug, id, depth: 0 })
  } catch {
    return NextResponse.json({ error: 'document not found' }, { status: 404 })
  }

  const editable = strip(current)
  const media = await payload.find({ collection: 'media', depth: 0, limit: 50 }).then((r) => r.docs.map((m: any) => ({ id: m.id, alt: m.alt, filename: m.filename }))).catch(() => []) // eslint-disable-line @typescript-eslint/no-explicit-any

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = `You edit one document for the NESTRE website CMS (${scope} "${slug}").
Apply the user's instruction to the JSON. Rules:
- Return ONLY the full updated JSON object (all fields), no prose, no markdown fences.
- Change only what the instruction asks; keep every other field intact.
- Image/upload fields take a media "id" (number) from the Available media list. Never invent ids.`
  const userMsg = `Instruction: ${instruction}\n\nAvailable media: ${JSON.stringify(media)}\n\nCurrent document:\n${JSON.stringify(editable, null, 2)}\n\nReturn the updated JSON object only.`

  let data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  let raw = ''
  try {
    const msg = await anthropic.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 4000, system, messages: [{ role: 'user', content: userMsg }] })
    raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('') // eslint-disable-line @typescript-eslint/no-explicit-any
    data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
  } catch (e) {
    return NextResponse.json({ error: 'ai_parse_failed', detail: String(e), raw: raw.slice(0, 300) }, { status: 502 })
  }

  const merged = { ...editable, ...data }
  try {
    if (scope === 'global') await payload.updateGlobal({ slug, data: merged as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
    else await payload.update({ collection: slug, id, data: merged as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ ok: true, message: 'Updated ✓' })
  } catch (e) {
    return NextResponse.json({ error: 'validation_failed', detail: String(e) }, { status: 422 })
  }
}
