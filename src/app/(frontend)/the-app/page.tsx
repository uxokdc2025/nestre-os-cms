import React from 'react'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { TheAppBody } from '../the-app-v2/page'

// /the-app now serves the refined build (good phone showcase + Mindset ring under
// it + parallax/gated-rise patterns). This specific route takes precedence over
// the catch-all CMS route for /the-app.
export const metadata: Metadata = {
  title: 'The NESTRE App — Your mind. On your schedule.',
  description:
    'Daily cognitive workouts, mental training, and Mindset Frames — deep work for the everyday, guided by your own performance data.',
  alternates: { canonical: `${SITE_URL}/the-app` },
  openGraph: {
    title: 'The NESTRE App', type: 'website', siteName: 'NESTRE', url: `${SITE_URL}/the-app`,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'The NESTRE App' }],
  },
}

export default function TheAppPage() {
  return <TheAppBody />
}
