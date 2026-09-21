import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SITE_URL } from '@/lib/seo'
import { RenderBlocks } from '@/components/RenderBlocks'
import { OurStoryV4 } from '@/components/OurStoryV4'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'

// /our-story — the real Our Story page. Explicit route (takes precedence over the
// CMS catch-all): hero + "Possibility" (CMS) → founder + leadership scrollytelling
// (OurStoryV4) → closing parallax with the swimmer (CMS) → footer.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Our Story — NESTRE',
  description:
    'The story behind NESTRE — founder Dr. Tommy Shavers and the world-class team building a new standard for cognitive performance.',
  alternates: { canonical: `${SITE_URL}/our-story` },
  openGraph: {
    title: 'Our Story — NESTRE',
    description:
      'The story behind NESTRE — founder Dr. Tommy Shavers and the world-class team building a new standard for cognitive performance.',
    type: 'website',
    siteName: 'NESTRE',
    url: `${SITE_URL}/our-story`,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Our Story — NESTRE' }],
  },
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OurStoryPage() {
  const payload = await getPayload({ config: await config })
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-story' } },
    depth: 2,
    limit: 1,
  })
  const layout: any[] = (pages.docs[0] as any)?.layout || []
  // Replace the founder "A different view" block with the scrollytelling.
  const fi = layout.findIndex((b) => b.blockType === 'featureRows' && /different view/i.test(b.heading || ''))
  const before = (fi >= 0 ? layout.slice(0, fi) : layout).map((b) =>
    // reference puts the "Possibility" section on the navy theme (paper is the founder story)
    b.blockType === 'featureRows' && /possibility|what we stand for/i.test(`${b.heading} ${b.eyebrow}`)
      ? { ...b, theme: 'navy' }
      : b,
  )
  const after = fi >= 0 ? layout.slice(fi + 1) : [] // closing parallax (swimmer)

  return (
    <>
      <main id="main">
        <RenderBlocks blocks={before} />
        <OurStoryV4 />
        <RenderBlocks blocks={after} />
      </main>
      <Reveal />
      <ReadingReveal />
    </>
  )
}
