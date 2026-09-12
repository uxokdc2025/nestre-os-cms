import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import config from '@/payload.config'
import { snapshot } from '@/lib/history'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * AI content editor. POST { slug, instruction }.
 * Reads the page's block layout, asks Claude to apply the instruction, and
 * writes the result back as a DRAFT through the Local API (which runs the
 * same validation as the admin — the agent cannot write invalid content).
 * Requires a logged-in Payload user (Authorization: JWT <token>).
 */
export async function POST(req: Request) {
  const { slug = 'home', instruction, blockIndex = null, elementHint = null, image = null, model: modelPref = 'auto', publish = false } = await req.json()
  if (!instruction) return NextResponse.json({ error: 'instruction required' }, { status: 400 })

  // Only two tiers are ever allowed — cheap Haiku (low) and Sonnet (med). Never
  // an expensive model. 'auto' picks Haiku for targeted field edits and Sonnet
  // for structural changes (add/remove/reorder) or whole-page instructions.
  const HAIKU = 'claude-haiku-4-5-20251001'
  const SONNET = 'claude-sonnet-5'
  const structural = /\b(add|new section|insert|remove|delete|duplicate|reorder|move|split)\b/i.test(instruction)
  const model = modelPref === 'haiku' ? HAIKU
    : modelPref === 'sonnet' ? SONNET
    : (typeof blockIndex === 'number' && !structural ? HAIKU : SONNET)

  const payload = await getPayload({ config: await config })

  // auth gate — must be a signed-in CMS user
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1, draft: false })
  const page = res.docs[0] as any
  if (!page) return NextResponse.json({ error: 'page not found' }, { status: 404 })

  const media = await payload.find({ collection: 'media', depth: 0, limit: 50 })
  const mediaList = media.docs.map((m: any) => ({ id: m.id, alt: m.alt, filename: m.filename }))

  let target = ''
  if (typeof blockIndex === 'number' && page.layout?.[blockIndex]) {
    target = `\nThe user SELECTED block index ${blockIndex} (blockType "${page.layout[blockIndex].blockType}"). Apply the instruction to THAT block only unless the instruction clearly refers to another. Leave all other blocks byte-for-byte unchanged.`
    if (elementHint?.role) {
      target += `\nWithin that block they clicked a specific ${elementHint.role}${elementHint.text ? ` containing "${elementHint.text}"` : ''}. Edit the single field that corresponds to that element (heading→heading, eyebrow→eyebrow, text/paragraph→body or the matching text field, button→the matching cta label/href, image→the image field). Change ONLY that field unless the instruction says otherwise.`
    }
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = `You edit the block layout of a marketing website page for the brand NESTRE.
You receive the current layout as a JSON array of blocks (each has a "blockType") and a list of available media (images) with their id + description.
Apply the user's instruction by editing the JSON. Rules:
- Return ONLY the full updated "layout" JSON array. No prose, no markdown fences.
- Preserve every block's "blockType" and overall structure. Only change what the instruction asks.
- To set or swap an image field, use a media "id" (number) from the Available media list.
- Keep all other fields intact. Never invent media ids.${target}`

  const userMsg = `Instruction: ${instruction}

Available media: ${JSON.stringify(mediaList)}

Current layout:
${JSON.stringify(page.layout ?? [], null, 2)}

Return the updated layout JSON array only.`

  // Optional screenshot the user attached in the chat (vision).
  const imgMatch = typeof image === 'string' ? image.match(/^data:(image\/[a-z.+-]+);base64,(.+)$/i) : null
  const content: any[] = [{ type: 'text', text: userMsg }]
  if (imgMatch) content.unshift({ type: 'image', source: { type: 'base64', media_type: imgMatch[1], data: imgMatch[2] } })

  let layout: unknown
  let raw = ''
  try {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content }],
    })
    raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('')
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    layout = JSON.parse(raw.slice(start, end + 1))
  } catch (e) {
    return NextResponse.json({ error: 'ai_parse_failed', detail: String(e), raw: raw.slice(0, 500) }, { status: 502 })
  }

  // Local API runs the same validation as the admin — invalid content is rejected.
  try {
    await snapshot(payload, slug, page.layout, instruction.slice(0, 60)) // restore point before the change
    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout } as any,
    })
    return NextResponse.json({
      ok: true,
      published: !!publish,
      message: publish ? `Saved & published "${slug}".` : `Updated "${slug}" — showing in preview.`,
      blocks: (updated.layout as any[])?.length,
    })
  } catch (e) {
    return NextResponse.json({ error: 'validation_failed', detail: String(e) }, { status: 422 })
  }
}
