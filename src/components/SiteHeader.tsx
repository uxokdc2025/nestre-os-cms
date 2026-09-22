'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ConsultPopover } from './ConsultPopover'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Internal links use next/link for instant client-side nav (no reload/flash);
// external, mailto, tel and anchors fall back to a plain <a>.
const isInternal = (h?: string) => !!h && h.startsWith('/') && !h.startsWith('//')
function A({ href, children, ...rest }: any) {
  // prefetch={false}: the header renders ~8 nav links; prefetching them all at once
  // fired a burst of RSC fetches at the force-dynamic pages, spiking the DB into
  // 500s that broke the very page you then clicked. Fetch on click instead.
  return isInternal(href) ? <Link href={href} prefetch={false} {...rest}>{children}</Link> : <a href={href || '#'} {...rest}>{children}</a>
}

export function SiteHeader({ items, cta, logoUrl }: { items: any[]; cta?: any; logoUrl?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href?: string) => {
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return false
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  // Brand wordmark — the vector logo (crisp at any size); logoUrl (CMS PNG) is the fallback.
  const Logo = () => (
    <Link href="/" className="brand-left" aria-label="NESTRE — home">
      <img className="nav-logo-img" src="/nestre-logo.svg" alt="NESTRE" />
    </Link>
  )
  void logoUrl

  // The header scrim is a dark→transparent gradient built for dark hero images; on
  // the light legal/support pages it smears over the copy, so use a solid navy block.
  const solid = ['/privacy', '/terms', '/help'].includes(pathname)

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}${solid ? ' nav-solid' : ''}`}>
      <div className="wrap inner">
        <button className={`nav-toggle${open ? ' open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
        <Logo />
        <nav className="links" aria-label="Primary">
          {items?.map((it, i) => (
            <A key={i} href={it.href || '#'} aria-current={isActive(it.href) ? 'page' : undefined}>
              {it.label}
            </A>
          ))}
        </nav>
        <div className="nav-right">
          {cta?.label && <ConsultPopover label={cta.label} listenGlobal />}
        </div>
        {cta?.label && <ConsultPopover label={cta.label} className="btn aqua mobile-cta" wrapClassName="consult-mobile" />}
      </div>

      {open && (
        <div className="nav-mobile" role="dialog" aria-label="Menu">
          {items?.map((it, i) => (
            <A key={i} href={it.href || '#'} aria-current={isActive(it.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
              {it.label}
            </A>
          ))}
          {cta?.label && <ConsultPopover label={cta.label} className="btn aqua" wrapClassName="consult-menu" />}

          <div className="nav-mobile-apps">
            <p className="nav-mobile-h">Get the app</p>
            <div className="nav-app-row">
              <a className="nav-app" href="https://apps.apple.com/us/app/nestre-health-and-performance/id6443393462" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M16.4 12.9c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7.9 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6s1.5.6 2.6.6c1.1 0 1.7-1 2.4-1.9.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-2-2.8zM14.6 6.9c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.4-1z"/></svg>
                iOS
              </a>
              <a className="nav-app" href="https://play.google.com/store/apps/details?id=com.nestreapp.prod" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M3.6 2.3c-.2.2-.3.5-.3.9v17.6c0 .4.1.7.3.9l.1.1L13.5 12 3.7 2.2l-.1.1zM17 15.3l-3.3-3.3-9.4 9.4c.4.3.9.3 1.5 0L17 15.3zM20.7 10.6l-3.2-1.8-3.6 3.2 3.6 3.5 3.2-1.8c.9-.6.9-1.9 0-2.5zM4.3 2.1l9.4 9.4 3.3-3.3L5.8 1.5c-.5-.3-1.1-.3-1.5.6z"/></svg>
                Android
              </a>
            </div>
          </div>

          <div className="nav-mobile-foot">
            <a href="mailto:tshavers@nestreperformance.com">tshavers@nestreperformance.com</a>
            <a href="tel:6897103260">689-710-3260</a>
            <A href="/privacy" onClick={() => setOpen(false)}>Privacy Policy</A>
          </div>
        </div>
      )}
    </header>
  )
}
