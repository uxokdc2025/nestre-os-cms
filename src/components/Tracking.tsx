import React from 'react'

// Marketing tracking, mirroring the WordPress original (nestreperformance.com):
//   • GA4 + Meta Pixel → SITE-WIDE (every page) — rendered from the root layout
//   • GTM             → get-started (ad) pages only — <GtmTag/> on those pages
// IDs are Noah's current snippets (GA G-5YC8WDXZL0 supersedes the old GT-57SFVZRH).
// Rendered as raw tags (not next/script) so they ship in the SSR HTML and fire on
// the initial load exactly as they did on WordPress.
const GTM_ID = 'GTM-NZLQ3SJJ'
const GA_ID = 'G-5YC8WDXZL0'
const PIXEL_ID = '1564504577305537'

// GA4 + Meta Pixel — site-wide.
export function AnalyticsBase() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
        }}
      />
      {/* Meta Pixel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
        }}
      />
    </>
  )
}

// Google Tag Manager — ad (get-started) pages only.
export function GtmTag() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        }}
      />
    </>
  )
}
