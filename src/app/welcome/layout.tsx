import React from 'react'
import { Instrument_Sans } from 'next/font/google'
import './welcome.css'

const instrument = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-instrument', display: 'swap' })

export const metadata = { title: 'Welcome to NESTRE', robots: { index: false } }

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={instrument.variable}>
      <body>{children}</body>
    </html>
  )
}
