import { getPayload } from 'payload'
import config from '@/payload.config'

// Fetch a legal/support doc page from the CMS. Returns the page title + its
// rich-text body (Lexical). Returns null on any miss so the route can fall back
// to its shipped content — the live page can never go blank.
export async function getDocPage(slug: string): Promise<{ title: string; content: unknown } | null> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const page = docs[0] as unknown as { title?: string; layout?: { blockType?: string; content?: unknown }[] }
    if (!page) return null
    const rich = (page.layout || []).find((b) => b.blockType === 'richText')
    if (!rich?.content) return null
    return { title: page.title || '', content: rich.content }
  } catch {
    return null
  }
}
