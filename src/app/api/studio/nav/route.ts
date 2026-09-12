import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const maxDuration = 60

/** GET → current nav { items, cta } (for the drag-reorder editor). Auth required. */
export async function GET() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const nav = (await payload.findGlobal({ slug: 'nav', depth: 0 })) as any
  return NextResponse.json({ items: nav?.items ?? [], cta: nav?.cta ?? {} })
}

/** Edit the primary navigation. POST with either:
 *   { items, cta }   → save directly (drag-reorder / manual edits), or
 *   { instruction }  → Claude rewrites the nav from natural language.
 *  Auth required. */
export async function POST(req: Request) {
  const body = await req.json()

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // direct save (from the drag-reorder editor)
  if (Array.isArray(body.items)) {
    const items = body.items
      .filter((i: any) => i && (i.label || i.href))
      .map((i: any) => ({ label: String(i.label || ''), href: String(i.href || '') }))
    try {
      const updated = await payload.updateGlobal({ slug: 'nav', data: { items, cta: body.cta ?? {} } as any })
      return NextResponse.json({ ok: true, message: 'Navigation saved.', items: (updated as any).items })
    } catch (e) {
      return NextResponse.json({ error: 'validation_failed', detail: String(e) }, { status: 422 })
    }
  }

  const { instruction } = body
  if (!instruction) return NextResponse.json({ error: 'instruction required' }, { status: 400 })

  const nav = (await payload.findGlobal({ slug: 'nav', depth: 0 })) as any
  const pages = await payload.find({ collection: 'pages', depth: 0, limit: 100 })
  const slugs = (pages.docs as any[]).map((p) => (p.slug === 'home' ? '/' : `/${p.slug}`))

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const system = `You edit the primary navigation of the NESTRE marketing site.
The nav is JSON: { "items": [{ "label": string, "href": string }], "cta": { "label": string, "href": string } }.
Apply the user's instruction (add/remove/rename/reorder links, or change the CTA).
Rules:
- Return ONLY the full updated nav JSON object. No prose, no markdown fences.
- Prefer existing site paths for href when a link points to a page. Existing pages: ${JSON.stringify(slugs)}.
- Keep hrefs as root-relative paths ("/slug") for internal pages, or full URLs / mailto:/tel: for external.
- Preserve the shape exactly. Never invent broken links.`

  const userMsg = `Instruction: ${instruction}\n\nCurrent nav:\n${JSON.stringify({ items: nav?.items ?? [], cta: nav?.cta ?? {} }, null, 2)}\n\nReturn the updated nav JSON object only.`

  let data: any
  let raw = ''
  try {
    const msg = await anthropic.messages.create({ model: 'claude-sonnet-5', max_tokens: 2000, system, messages: [{ role: 'user', content: userMsg }] })
    raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('')
    data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
  } catch (e) {
    return NextResponse.json({ error: 'ai_parse_failed', detail: String(e), raw: raw.slice(0, 400) }, { status: 502 })
  }

  try {
    const updated = await payload.updateGlobal({ slug: 'nav', data: { items: data.items ?? [], cta: data.cta ?? {} } as any })
    return NextResponse.json({ ok: true, message: 'Navigation updated.', items: (updated as any).items })
  } catch (e) {
    return NextResponse.json({ error: 'validation_failed', detail: String(e) }, { status: 422 })
  }
}
