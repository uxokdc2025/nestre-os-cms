import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { MindsetRing } from '@/components/MindsetRing'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'
import { siteGraph, faqGraph, SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

async function getPage(slugParts?: string[], draft = false) {
  const slug = slugParts?.join('/') || 'home'
  // /appv2 is a sandbox that reuses the-app content while we iterate on the
  // Mindset-ring persona experiment, without changing the live /the-app.
  const dbSlug = slug === 'appv2' ? 'the-app' : slug
  const payload = await getPayload({ config: await config })
  const [pages, nav, footer, brand] = await Promise.all([
    payload.find({ collection: 'pages', where: { slug: { equals: dbSlug } }, depth: 2, limit: 1, draft }),
    payload.findGlobal({ slug: 'nav', depth: 0 }).catch(() => null),
    payload.findGlobal({ slug: 'footer', depth: 0 }).catch(() => null),
    payload.findGlobal({ slug: 'brand', depth: 1 }).catch(() => null),
  ])
  return { page: pages.docs[0] as any, nav: nav as any, footer: footer as any, brand: brand as any }
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const { page } = await getPage(slug)
  if (!page) return { title: 'Not found' }
  const path = !slug?.length || slug.join('/') === 'home' ? '/' : `/${slug.join('/')}`
  const title = page.metaTitle || page.title
  const description = page.metaDescription || undefined
  return {
    title,
    description,
    ...(slug?.join('/') === 'appv2' ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: path === '/' ? SITE_URL : `${SITE_URL}${path}` },
    openGraph: {
      title, description, type: 'website', siteName: 'NESTRE',
      url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
      images: [{ url: '/og', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og'] },
  }
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug?: string[] }>; searchParams?: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params
  const studio = (await searchParams)?.studio === '1'
  const { page } = await getPage(slug) // published (version tables are managed by Payload only)
  if (!page) notFound()

  const faq = faqGraph(page.layout || [])
  const slugStr = slug?.join('/') || 'home'
  // Mindset ring lives only on the /appv2 sandbox now — removed from live /the-app.
  const afterHero = slugStr === 'appv2' ? <MindsetRing /> : undefined
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }} />
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />}
      <main id="main">
        <RenderBlocks blocks={page.layout || []} afterHero={afterHero} />
      </main>
      {!studio && <Reveal />}
      {!studio && <ReadingReveal />}
    </>
  )
}
