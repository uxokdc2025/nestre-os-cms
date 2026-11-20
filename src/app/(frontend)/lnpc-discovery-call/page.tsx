import { AdLandingBody } from '@/components/AdLandingBody'
import { AD_LANDING, AD_LANDING_META } from '@/lib/ad-landing'

// Ad-only page: noindex and deliberately left out of the sitemap. Both URLs of
// the pair share one title/description and render the same combined page.
export const metadata = AD_LANDING_META.discovery

export default function LnpcDiscoveryCall() {
  return <AdLandingBody cfg={AD_LANDING['/lnpc-discovery-call']} />
}
