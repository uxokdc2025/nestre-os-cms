'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AD_LANDING } from '@/lib/ad-landing'
import { HOLIDAY_PATH } from '@/lib/holiday-campaign'

// The ad landing pages follow their prototypes: no site nav and no marketing
// footer, just a one-line footer the page draws itself (AdLandingBody). The
// header already strips itself (SiteHeader); this hides the site footer on
// exactly those paths and leaves every other page untouched.
export function HideOnAdLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // The holiday landing page also carries its own footer.
  return AD_LANDING[pathname] || pathname === HOLIDAY_PATH ? null : <>{children}</>
}
