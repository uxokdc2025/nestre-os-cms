import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { OurStoryV3 } from '@/components/OurStoryV3'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'

// /our-story-v3 — full Our Story page with the scrollytelling middle:
// hero + "Possibility" (CMS) → founder-story + leadership scrollytelling
// (in place of the CMS "A different view" block) → closing parallax (CMS) → footer.
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Our Story — v3 (review)',
  robots: { index: false, follow: false },
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OurStoryV3Page() {
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
  const before = fi >= 0 ? layout.slice(0, fi) : layout // hero + Possibility
  const after = fi >= 0 ? layout.slice(fi + 1) : [] // closing parallax

  return (
    <>
      <main id="main">
        <RenderBlocks blocks={before} />
        <OurStoryV3 />
        <RenderBlocks blocks={after} />
      </main>
      <Reveal />
      <ReadingReveal />
    </>
  )
}
