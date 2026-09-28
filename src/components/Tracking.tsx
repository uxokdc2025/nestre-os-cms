'use client'

import { useEffect, useState } from 'react'

// Marketing tracking, consent-gated. GA4 + Meta Pixel (site-wide) and GTM
// (get-started ad pages) only load AFTER the visitor accepts cookies — nothing
// non-essential fires until then. Choice is remembered in localStorage.
// IDs are Noah's current snippets.
const GTM_ID = 'GTM-NZLQ3SJJ'
const GA_ID = 'G-5YC8WDXZL0'
const PIXEL_ID = '1564504577305537'
const KEY = 'nestre-cookie-consent'

/* eslint-disable @typescript-eslint/no-explicit-any */
function loadBaseAnalytics() {
  const w = window as any
  if (w.__nestreAnalyticsLoaded) return
  w.__nestreAnalyticsLoaded = true
  // GA4
  const g = document.createElement('script')
  g.async = true
  g.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(g)
  w.dataLayer = w.dataLayer || []
  w.gtag = function () { w.dataLayer.push(arguments) }
  w.gtag('js', new Date())
  w.gtag('config', GA_ID)
  // Meta Pixel
  ;(function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return
    const n: any = (f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) })
    if (!f._fbq) f._fbq = n
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
    const t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v
    const s = b.getElementsByTagName(e)[0]; s.parentNode!.insertBefore(t, s)
  })(w, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  w.fbq('init', PIXEL_ID)
  w.fbq('track', 'PageView')
  window.dispatchEvent(new Event('nestre:consent-accepted'))
}

// Consent banner + gated GA4/Meta Pixel — rendered site-wide from the layout.
export function AnalyticsBase() {
  const [choice, setChoice] = useState<'unknown' | 'accepted' | 'declined'>('unknown')

  useEffect(() => {
    let c: string | null = null
    try { c = localStorage.getItem(KEY) } catch {}
    if (c === 'accepted') { setChoice('accepted'); loadBaseAnalytics() }
    else if (c === 'declined') setChoice('declined')
    else setChoice('unknown')
  }, [])

  const accept = () => { try { localStorage.setItem(KEY, 'accepted') } catch {}; setChoice('accepted'); loadBaseAnalytics() }
  const decline = () => { try { localStorage.setItem(KEY, 'declined') } catch {}; setChoice('declined') }

  if (choice !== 'unknown') return null
  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
      <p className="cookie-consent-text">
        We use cookies to measure site traffic and improve your experience. See our <a href="/privacy">Privacy Policy</a>.
      </p>
      <div className="cookie-consent-btns">
        <button type="button" className="btn cookie-decline" onClick={decline}>Decline</button>
        <button type="button" className="btn aqua cookie-accept" onClick={accept}>Accept</button>
      </div>
    </div>
  )
}

// Google Tag Manager — ad (get-started) pages only. Also gated on consent.
export function GtmTag() {
  useEffect(() => {
    const load = () => {
      const w = window as any
      if (w.__nestreGtmLoaded) return
      w.__nestreGtmLoaded = true
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
      const j = document.createElement('script')
      j.async = true
      j.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
      document.head.appendChild(j)
    }
    let c: string | null = null
    try { c = localStorage.getItem(KEY) } catch {}
    if (c === 'accepted') { load(); return }
    const h = () => load()
    window.addEventListener('nestre:consent-accepted', h)
    return () => window.removeEventListener('nestre:consent-accepted', h)
  }, [])
  return null
}
