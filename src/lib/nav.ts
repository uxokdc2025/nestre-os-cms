// Campaign links that must appear in the live header even when the Payload `nav`
// global has not been edited. Desktop and mobile both render this same list
// (SiteHeader). Existing CMS rows are kept, in order. Required campaign links
// are inserted at a fixed position if missing, and moved there if a CMS row
// already has the same href in the wrong place, so they cannot be duplicated.

export type NavItem = { label?: string | null; href?: string | null }

// Chloe, Nov 25 2026: "NESTRE Holidays" in the main nav, immediately after
// For Teams, linking to /holiday. (Her email had an apostrophe; the label
// does not.)
export const CAMPAIGN_NAV: { label: string; href: string }[] = [
  { label: 'NESTRE Holidays', href: '/holiday' },
]

// Hrefs that must never show up in the top nav strip, whatever the Payload `nav`
// global still holds. "For Veterans" moved to the footer's Company column
// (SiteFooter) for Chloe's Nov 18 ad review; filtering it here as well means a
// stale CMS row can't put it back in the header. The /for-veterans page itself
// is unchanged.
const FOOTER_ONLY = new Set(['/for-veterans'])

// Where to place each campaign href: immediately after this existing href.
// If that neighbor is missing, the item is appended.
const AFTER_HREF: Record<string, string> = {
  '/holiday': '/for-teams',
}

export function withCampaignNav(items: NavItem[] | null | undefined): NavItem[] {
  const list = (Array.isArray(items) ? items : [])
    .filter((item) => item && (item.label || item.href))
    .filter((item) => !FOOTER_ONLY.has((item.href || '').trim()))

  for (const item of CAMPAIGN_NAV) {
    const existing = list.findIndex((it) => (it.href || '').trim() === item.href)
    if (existing >= 0) list.splice(existing, 1)
    const afterHref = AFTER_HREF[item.href]
    const after = afterHref ? list.findIndex((it) => (it.href || '').trim() === afterHref) : -1
    list.splice(after >= 0 ? after + 1 : list.length, 0, item)
  }
  return list
}
