import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const PRIORITY: Record<string, number> = { home: 1.0, 'how-it-works': 0.9, 'neuro-labs': 0.9, 'the-app': 0.8, 'book-a-consultation': 0.8 }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload({ config: await config })
    const { docs } = await payload.find({ collection: 'pages', limit: 100, depth: 0, draft: false })
    const cms = (docs as { slug: string; updatedAt?: string }[]).map((p) => ({
      url: p.slug === 'home' ? SITE_URL : `${SITE_URL}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: PRIORITY[p.slug] ?? 0.7,
    }))
    // Standalone routes (not CMS pages). /news is hidden from nav but indexed for SEO.
    const extra = [
      { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
      { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.2 },
    ]
    return [...cms, ...extra]
  } catch {
    return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }]
  }
}
