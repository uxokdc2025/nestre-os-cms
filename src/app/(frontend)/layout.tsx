import React from 'react'
import { Instrument_Sans } from 'next/font/google'
import { SITE_URL } from '@/lib/seo'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Carousels } from '@/components/Carousels'
import { getChrome } from '@/lib/chrome'
import { brandCss } from '@/lib/brand-css'
import { BottomBlur } from '@/components/BottomBlur'
import { CustomCursor } from '@/components/CustomCursor'
import { AnalyticsBase } from '@/components/Tracking'
import './styles.css'

const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'NESTRE — Performance. From within.', template: '%s · NESTRE' },
  description: 'NESTRE turns cognitive performance data into personalized NeuroStrength Training, guided by a NeuroTrainer.',
  applicationName: 'NESTRE',
  openGraph: {
    type: 'website', siteName: 'NESTRE', locale: 'en_US', url: SITE_URL,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'NESTRE — Performance. From within.' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og'] },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { nav, footer, brand, logoUrl } = await getChrome()
  const { css: brandStyle, fontHref } = brandCss(brand)
  return (
    <html lang="en" className={instrument.variable}>
      <body>
        <AnalyticsBase />
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        {brandStyle && <style id="brand-tokens" dangerouslySetInnerHTML={{ __html: brandStyle }} />}
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader items={nav?.items || []} cta={nav?.cta} logoUrl={logoUrl} />
        {children}
        <BottomBlur />
        <CustomCursor />
        <Carousels />
        <SiteFooter logoUrl={logoUrl} footer={footer} />
      </body>
    </html>
  )
}
