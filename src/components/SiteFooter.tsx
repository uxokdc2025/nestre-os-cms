import React from 'react'
import Link from 'next/link'

const isInternal = (h?: string) => !!h && h.startsWith('/') && !h.startsWith('//')
function A({ href, children, ...rest }: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return isInternal(href) ? <Link href={href} {...rest}>{children}</Link> : <a href={href || '#'} {...rest}>{children}</a>
}

// Verified NESTRE channels (from nestreperformance.com). App/podcast links match JSON-LD sameAs.
const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/nestrebetter/' },
  { label: 'X', href: 'https://x.com/NESTREBetter' },
  { label: 'Facebook', href: 'https://www.facebook.com/NESTREBetter/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/nestre' },
  { label: 'YouTube', href: 'https://www.youtube.com/@BetterMindPodcast' },
  { label: 'Spotify', href: 'https://open.spotify.com/show/5rL7sOe1lvUmH814dzzbGp' },
  { label: 'ApplePodcasts', href: 'https://podcasts.apple.com/us/podcast/the-better-mind-podcast/id1668627436' },
]
const IOS = 'https://apps.apple.com/us/app/nestre-health-and-performance/id6443393462'
const ANDROID = 'https://play.google.com/store/apps/details?id=com.nestreapp.prod'

const COLUMNS = [
  { heading: 'Explore', links: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Neuro Labs', href: '/neuro-labs' },
    { label: 'The App', href: '/the-app' },
  ] },
  { heading: 'Company', links: [
    { label: 'Our Story', href: '/our-story' },
    { label: 'For Teams', href: '/for-teams' },
    { label: 'News', href: '/news' },
  ] },
  { heading: 'Get started', links: [
    { label: 'Book a Consultation', href: '/book-a-consultation' },
    { label: 'Download for iOS', href: IOS, external: true },
    { label: 'Get it for Android', href: ANDROID, external: true },
  ] },
]

function Icon({ name }: { name: string }) {
  const p: Record<string, React.ReactNode> = {
    Instagram: <><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" /></>,
    X: <path d="M3 3l7.6 9.6L3.4 21H6l5.2-6 4.7 6H21l-7.9-10L20.3 3H17.8L13 8.6 8.6 3H3z" fill="currentColor" stroke="none" />,
    Facebook: <path d="M14.5 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6C16.6 2.6 15.7 2.5 14.7 2.5c-2.2 0-3.7 1.3-3.7 3.8v2.2H8.5V12H11v9.5h3.5V12h2.5l.4-3.5h-2.9z" fill="currentColor" stroke="none" />,
    LinkedIn: <><rect x="2" y="2" width="20" height="20" rx="4.5" /><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" /><path d="M7 10v7" /><path d="M11 17v-4a2.2 2.2 0 0 1 4.4 0v4M11 10v7" /></>,
    YouTube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 8.8v6.4l5.5-3.2z" fill="currentColor" stroke="none" /></>,
    Google: <path d="M21.4 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h5.3a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 2.9-4.3 2.9-7.1zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22zM6.4 13.9a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z" fill="currentColor" stroke="none" />,
    Spotify: <><circle cx="12" cy="12" r="9.6" /><path d="M7.2 9.7c3.1-.8 6.6-.5 9 1.1M7.7 12.6c2.3-.6 4.9-.4 6.8.9M8.3 15.2c1.6-.4 3.5-.3 5 .6" /></>,
    ApplePodcasts: <><circle cx="12" cy="10.4" r="2.2" /><path d="M12 2.5a9.5 9.5 0 0 0-4.6 17.8M12 2.5a9.5 9.5 0 0 1 4.6 17.8" /><path d="M9.2 15.4c0-1.6 1.2-2.5 2.8-2.5s2.8.9 2.8 2.5l-.7 4.4c-.15.9-1 1.2-2.1 1.2s-1.95-.3-2.1-1.2z" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      {p[name]}
    </svg>
  )
}

export function SiteFooter({ logoUrl, footer }: { logoUrl?: string; footer?: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const year = new Date().getFullYear()
  const tagline = footer?.tagline || 'Cognitive performance, made personal. Understand your mind, then train it.'
  const email = footer?.contactEmail || 'info@nestreperformance.com'
  const phone = footer?.contactPhone || '689-710-3260'
  const legal = footer?.legalNote || 'NESTRE Health & Performance Inc. All rights reserved.'
  const tel = phone.replace(/[^0-9+]/g, '')
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <div className="footer-brand">
          <Link href="/" aria-label="NESTRE — home">
            {logoUrl ? <img className="footer-logo" src={logoUrl} alt="NESTRE" /> : <span className="logo">NESTRE</span>}
          </Link>
          <p className="footer-tag">{tagline}</p>
          <ul className="socials" aria-label="NESTRE on social media">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <Icon name={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="footer-h">{col.heading}</p>
              {col.links.map((l) => (
                <A key={l.label} href={l.href} {...(('external' in l && l.external) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {l.label}
                </A>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <p>© {year} {legal}</p>
        <div className="footer-legal">
          <Link href="/privacy">Privacy Policy</Link>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${tel}`}>{phone}</a>
        </div>
      </div>
    </footer>
  )
}
