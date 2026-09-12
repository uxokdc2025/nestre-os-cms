import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import config from '@/payload.config'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'
export const maxDuration = 60

// Collect every media object nested anywhere in the page layout (dedupe by id).
function collectImages(node: any, out: Map<number, { id: number; filename: string; alt: string }>) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) { node.forEach((n) => collectImages(n, out)); return }
  if (typeof node.id === 'number' && typeof node.filename === 'string') {
    out.set(node.id, { id: node.id, filename: node.filename, alt: node.alt || '' })
  }
  for (const v of Object.values(node)) collectImages(v, out)
}

async function loadFacts(payload: any, slug: string) {
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 2, limit: 1 })
  const page = res.docs[0]
  if (!page) return null
  const path = slug === 'home' ? '/' : `/${slug}`
  const layout = page.layout || []
  const hasFaq = layout.some((b: any) => b.blockType === 'faq')
  const imgs = new Map<number, { id: number; filename: string; alt: string }>()
  collectImages(layout, imgs)
  const images = [...imgs.values()]
  const schema = ['Organization / MedicalBusiness', 'WebSite', '3× MedicalBusiness (Neuro Labs)', 'SoftwareApplication (App)']
  if (hasFaq) schema.push('FAQPage')
  return {
    slug,
    metaTitle: page.metaTitle || page.title || '',
    metaDescription: page.metaDescription || '',
    canonical: `${SITE_URL}${path === '/' ? '' : path}`,
    ogImage: `${SITE_URL}/og`,
    indexable: true,
    schema,
    images,
    checks: [
      { label: 'Meta title', ok: !!(page.metaTitle || page.title), hint: 'Shown in search + browser tab' },
      { label: 'Meta description', ok: !!page.metaDescription, hint: '≤160 chars, summarizes the page' },
      { label: 'Structured data (JSON-LD)', ok: true, hint: 'Entity + FAQ graph for AI answers' },
      { label: 'Social card (OG image)', ok: true, hint: 'Shown when shared' },
      { label: 'All images have alt text', ok: images.every((i) => i.alt), hint: `${images.filter((i) => !i.alt).length} missing` },
    ],
  }
}

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug') || 'home'
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const facts = await loadFacts(payload, slug)
  if (!facts) return NextResponse.json({ error: 'page not found' }, { status: 404 })
  return NextResponse.json(facts)
}

/** AI-improve SEO. POST { slug, instruction, mediaId? }.
 *  mediaId set → rewrite that image's alt text; else improve the page meta title/description. */
export async function POST(req: Request) {
  const { slug = 'home', instruction, mediaId = null } = await req.json()
  if (!instruction) return NextResponse.json({ error: 'instruction required' }, { status: 400 })
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    if (typeof mediaId === 'number') {
      const m = (await payload.findByID({ collection: 'media', id: mediaId, depth: 0 })) as any
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-5', max_tokens: 200,
        system: 'You write concise, descriptive, accessible alt text for images on the NESTRE (cognitive performance) website. Return ONLY the alt text, no quotes, under 125 characters.',
        messages: [{ role: 'user', content: `Instruction: ${instruction}\nImage file: ${m?.filename}\nCurrent alt: ${m?.alt || '(none)'}` }],
      })
      const alt = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('').trim().replace(/^["']|["']$/g, '')
      await payload.update({ collection: 'media', id: mediaId, data: { alt } as any })
      return NextResponse.json({ ok: true, message: `Updated alt text.`, alt })
    }

    const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1 })
    const page = res.docs[0] as any
    if (!page) return NextResponse.json({ error: 'page not found' }, { status: 404 })
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-5', max_tokens: 400,
      system: `You optimize SEO meta for the NESTRE (cognitive performance / neuro-strength) website. Return ONLY JSON: {"metaTitle": string (<60 chars), "metaDescription": string (<160 chars)}. Compelling, keyword-aware, human.`,
      messages: [{ role: 'user', content: `Instruction: ${instruction}\nPage: ${page.title}\nCurrent metaTitle: ${page.metaTitle || ''}\nCurrent metaDescription: ${page.metaDescription || ''}` }],
    })
    const raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('')
    const data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
    await payload.update({ collection: 'pages', id: page.id, data: { metaTitle: data.metaTitle, metaDescription: data.metaDescription } as any })
    return NextResponse.json({ ok: true, message: 'SEO meta updated.', ...data })
  } catch (e) {
    return NextResponse.json({ error: 'seo_edit_failed', detail: String(e) }, { status: 422 })
  }
}
