// Campaign links that must appear in the live header even when the Payload `nav`
// global has not been edited. Desktop and mobile both render this same list
// (SiteHeader), with the Book CTA rendered separately after it.
// Existing CMS rows are kept, in order. These are appended only when that href
// is not already present, so a later CMS edit cannot duplicate them.

export type NavItem = { label?: string | null; href?: string | null }

export const CAMPAIGN_NAV: { label: string; href: string }[] = [
  { label: 'For Veterans', href: '/for-veterans' },
]

export function withCampaignNav(items: NavItem[] | null | undefined): NavItem[] {
  const list = Array.isArray(items) ? items.filter((item) => item && (item.label || item.href)) : []
  const hrefs = new Set(list.map((item) => (item.href || '').trim()))
  for (const item of CAMPAIGN_NAV) {
    if (!hrefs.has(item.href)) list.push(item)
  }
  return list
}
