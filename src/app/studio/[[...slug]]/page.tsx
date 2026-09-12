import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Studio } from '@/components/Studio'

export const dynamic = 'force-dynamic'

export default async function StudioPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  // Auth gate — only signed-in CMS users reach the studio.
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin/login?redirect=/studio')

  const res = await payload.find({ collection: 'pages', depth: 0, limit: 100, draft: true, sort: 'slug' })
  const pages = (res.docs as { slug: string; title?: string }[]).map((p) => ({ slug: p.slug, title: p.title || p.slug }))

  const initialSlug = slug?.join('/') || (pages.find((p) => p.slug === 'home') ? 'home' : pages[0]?.slug) || 'home'
  return <Studio pages={pages} initialSlug={initialSlug} />
}
