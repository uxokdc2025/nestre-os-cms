import type { Metadata } from 'next'
import { SITE_URL, ogFor } from '@/lib/seo'
import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING, AD_LANDING_META } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap. Both URLs of
// the pair share one title/description and render the same combined page (#31);
// each URL keeps its own canonical + og:url (#29).
const meta = AD_LANDING_META.consultation
const title = (meta.title as { absolute: string }).absolute
const description = meta.description ?? undefined
export const metadata: Metadata = {
  ...meta,
  alternates: { canonical: `${SITE_URL}/lnpc-consultation` },
  openGraph: ogFor('/lnpc-consultation', title, description),
  robots: { index: false, follow: false },
}

export default function LnpcConsultation() {
  return <AdLandingBody cfg={AD_LANDING['/lnpc-consultation']} />
}
