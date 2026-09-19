import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { OurStoryV4 } from '@/components/OurStoryV4'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'

// /our-story-v4 — same page shell as v3 (hero + "Possibility" from CMS → founder
// + leadership scrollytelling → closing parallax → footer), with the V4 leadership
// interaction (ring-only left, travelling name list with description underneath).
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Our Story — v4 (review)',
  robots: { index: false, follow: false },
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OurStoryV4Page() {
  const payload = await getPayload({ config: await config })
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-story' } },
    depth: 2,
    limit: 1,
  })
  const layout: any[] = (pages.docs[0] as any)?.layout || []
  const fi = layout.findIndex((b) => b.blockType === 'featureRows' && /different view/i.test(b.heading || ''))
  const before = (fi >= 0 ? layout.slice(0, fi) : layout).map((b) =>
    b.blockType === 'featureRows' && /possibility|what we stand for/i.test(`${b.heading} ${b.eyebrow}`)
      ? { ...b, theme: 'navy' }
      : b,
  )
  const after = fi >= 0 ? layout.slice(fi + 1) : []

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
