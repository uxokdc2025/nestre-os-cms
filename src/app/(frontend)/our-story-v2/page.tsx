import { getPayload } from 'payload'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { RenderBlocks } from '@/components/RenderBlocks'
import { LeadershipCarousel } from '@/components/LeadershipCarousel'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'

// ─────────────────────────────────────────────────────────────────────────────
// /our-story-v2 — review build of Our Story. Renders the live CMS Our Story
// content, then drops the "Your NESTRE Mindset Team" leadership carousel in right
// after Dr. Tommy Shavers' bio ("A different view…" block). Noindexed.
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Story — v2 (review)',
  robots: { index: false, follow: false },
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OurStoryV2() {
  const payload = await getPayload({ config: await config })
  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'our-story' } },
    depth: 2,
    limit: 1,
  })
  const page = pages.docs[0] as any
  if (!page) notFound()

  const layout: any[] = page.layout || []
  // Insert the leadership carousel immediately after the founder bio block.
  const idx = layout.findIndex(
    (b) => b.blockType === 'featureRows' && /different view/i.test(b.heading || ''),
  )
  const before = idx >= 0 ? layout.slice(0, idx + 1) : layout
  const after = idx >= 0 ? layout.slice(idx + 1) : []

  return (
    <>
      <main id="main">
        <RenderBlocks blocks={before} />
        <LeadershipCarousel />
        {after.length > 0 && <RenderBlocks blocks={after} />}
      </main>
      <Reveal />
      <ReadingReveal />
    </>
  )
}
