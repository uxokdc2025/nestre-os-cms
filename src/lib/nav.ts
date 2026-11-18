// Campaign links that must appear in the live header even when the Payload `nav`
// global has not been edited. Desktop and mobile both render this same list
// (SiteHeader), with the Book CTA rendered separately after it.
// Existing CMS rows are kept, in order. These are appended only when that href
// is not already present, so a later CMS edit cannot duplicate them.

export type NavItem = { label?: string | null; href?: string | null }

export const CAMPAIGN_NAV: { label: string; href: string }[] = [
  { label: 'NESTRE Holidays', href: '/nestre-holidays' },
]

// Hrefs that must never show up in the top nav strip, whatever the Payload `nav`
// global still holds. "For Veterans" moved to the footer's Company column
// (SiteFooter) for Chloe's Nov 18 ad review; filtering it here as well means a
// stale CMS row can't put it back in the header. The /for-veterans page itself
// is unchanged.
const FOOTER_ONLY = new Set(['/for-veterans'])

export function withCampaignNav(items: NavItem[] | null | undefined): NavItem[] {
  const list = (Array.isArray(items) ? items : [])
    .filter((item) => item && (item.label || item.href))
    .filter((item) => !FOOTER_ONLY.has((item.href || '').trim()))
  const hrefs = new Set(list.map((item) => (item.href || '').trim()))
  for (const item of CAMPAIGN_NAV) {
    if (!hrefs.has(item.href)) list.push(item)
  }
  return list
}
