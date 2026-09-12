import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

/** Create a new page. POST { title, slug? }. Auth required. Ships a starter hero
 *  + closing CTA and SEO defaults so it's immediately editable + indexable. */
export async function POST(req: Request) {
  const body = await req.json()
  const title = (body.title || '').trim()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  const slug = slugify(body.slug || title)
  if (!slug) return NextResponse.json({ error: 'could not derive a slug' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const exists = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  if (exists.docs.length) return NextResponse.json({ error: `A page with slug "${slug}" already exists.`, slug }, { status: 409 })

  const layout = [
    { blockType: 'hero', eyebrow: title, heading: `${title}.`, body: 'Edit this page with AI — click a section and tell it what to change.', ctas: [{ label: 'Book a Consultation', href: '/book-a-consultation', style: 'aqua' }] },
    { blockType: 'closingCta', theme: 'navy', heading: 'Ready for more?', body: 'Understand where you are. Train for what’s next.', ctas: [{ label: 'Book a Consultation', href: '/book-a-consultation', style: 'aqua' }] },
  ]

  try {
    const doc = await payload.create({
      collection: 'pages',
      data: {
        title, slug, layout,
        metaTitle: `${title} — NESTRE`,
        metaDescription: `${title} at NESTRE — cognitive performance, made personal.`,
      } as any,
    })
    return NextResponse.json({ ok: true, slug: (doc as any).slug, title: (doc as any).title, message: `Created page “${title}”.` })
  } catch (e) {
    return NextResponse.json({ error: 'create_failed', detail: String(e) }, { status: 422 })
  }
}
