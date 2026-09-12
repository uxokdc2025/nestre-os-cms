import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const runtime = 'nodejs'

/** Delete a page. POST { slug }. Auth required. Home is protected. Also removes
 *  any primary-nav link that pointed at the deleted page. */
export async function POST(req: Request) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })
  if (slug === 'home') return NextResponse.json({ error: 'The home page cannot be deleted.' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  const page = res.docs[0] as any
  if (!page) return NextResponse.json({ error: 'page not found' }, { status: 404 })

  try {
    await payload.delete({ collection: 'pages', id: page.id })
    // prune the nav so we never leave a dead link behind
    const nav = (await payload.findGlobal({ slug: 'nav', depth: 0 })) as any
    const items = (nav?.items ?? []).filter((i: any) => i.href !== `/${slug}`)
    if (items.length !== (nav?.items ?? []).length) {
      await payload.updateGlobal({ slug: 'nav', data: { items, cta: nav?.cta } as any })
    }
    return NextResponse.json({ ok: true, message: `Deleted “${page.title || slug}”.` })
  } catch (e) {
    return NextResponse.json({ error: 'delete_failed', detail: String(e) }, { status: 422 })
  }
}
