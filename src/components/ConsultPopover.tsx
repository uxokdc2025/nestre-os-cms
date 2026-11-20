'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BOOK_LOCATIONS, type ConsultLocation } from '@/lib/book-training'

// "Book a Consultation" CTA that opens a location picker.
// - Desktop: a dropdown anchored under the button (absolute, closes on outside click / Esc).
// - Mobile (≤620px): a bottom drawer (sheet) portaled to <body> so it anchors to the
//   viewport, escaping the header's transformed containing block. Closes via backdrop / Esc.
// Each location has a "Book Now" CTA that opens its Acuity booking.
//
// `locations`, `icon`, `prerender` and `detached` are the opt-ins the ad landing
// pages use (see AdLandingBody / SiteHeader). With all four left at their
// defaults this renders exactly what the main site has always rendered.
export function ConsultPopover({
  label = 'Book a Consultation',
  className = 'btn aqua nav-cta',
  wrapClassName = '',
  onOpen,
  listenGlobal = false,
  locations = BOOK_LOCATIONS,
  icon,
  prerender = false,
  detached = false,
}: {
  label?: string
  className?: string
  wrapClassName?: string
  onOpen?: () => void
  listenGlobal?: boolean
  /** The locations the menu offers. Defaults to every NESTRE location. */
  locations?: ConsultLocation[]
  /** Trailing icon rendered after the label — e.g. <ArrowIcon/> on the ad pages. */
  icon?: ReactNode
  /** Keep the menu in the DOM while closed (hidden), so its booking links are in
   *  the server-rendered HTML instead of being built on first open. */
  prerender?: boolean
  /** Portal the open menu to <body> and fix-position it under the button, for
   *  callers that sit inside a section which clips overflow or recolours /
   *  centres its text (the ad hero and closing band do both). */
  detached?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<CSSProperties | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 620px)')
    const on = () => setIsMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // `detached` desktop menus are position: fixed, so they carry the button's
  // coordinates themselves. Width mirrors .consult-pop. The menu hangs from the
  // button's left edge, or from its right edge when that would overrun the
  // viewport (the header CTA, matching the main site's dropdown), and flips above
  // the button when there isn't room under it.
  const place = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    const width = Math.min(380, window.innerWidth * 0.92)
    const below = window.innerHeight - r.bottom
    const flip = below < 340 && r.top > below
    const from = r.left + width <= window.innerWidth - 12 ? r.left : r.right - width
    const style: CSSProperties = {
      position: 'fixed',
      left: Math.max(12, Math.min(from, window.innerWidth - width - 12)),
      right: 'auto',
      top: flip ? 'auto' : r.bottom + 14,
      bottom: flip ? window.innerHeight - r.top + 14 : 'auto',
      maxHeight: Math.max(240, (flip ? r.top : below) - 28),
      overflowY: 'auto',
    }
    setPos(style)
  }, [])

  // Open from anywhere via a window event.
  useEffect(() => {
    if (!listenGlobal) return
    const openIt = () => { onOpen?.(); setOpen(true) }
    window.addEventListener('nestre:open-consult', openIt as EventListener)
    return () => window.removeEventListener('nestre:open-consult', openIt as EventListener)
  }, [listenGlobal, onOpen])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    // desktop closes on outside click; mobile closes via the backdrop (the portaled
    // panel lives outside wrapRef, so this handler must not run there).
    const onClick = (e: MouseEvent) => {
      if (isMobile) return
      const t = e.target as Node
      if (wrapRef.current?.contains(t) || popRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open, isMobile])

  // A detached menu is anchored to the button, so follow it while it is open.
  useEffect(() => {
    if (!open || !detached || isMobile) return
    place()
    window.addEventListener('scroll', place, { passive: true })
    window.addEventListener('resize', place)
    return () => { window.removeEventListener('scroll', place); window.removeEventListener('resize', place) }
  }, [open, detached, isMobile, place])

  // A detached menu is portaled to the end of <body>, so it falls outside the
  // button's tab order: move focus into the dialog on open (which also announces
  // it) and hand it back to the button on close.
  useEffect(() => {
    if (!detached) return
    if (open) popRef.current?.focus()
    else if (wasOpen.current) btnRef.current?.focus()
    wasOpen.current = open
  }, [open, detached])

  const panel = (style?: CSSProperties) => (
    <>
      <div className="consult-backdrop" aria-hidden onClick={() => setOpen(false)} />
      <div className="consult-pop" role="dialog" aria-modal="true" aria-label="Book a consultation" ref={popRef} style={style} tabIndex={detached ? -1 : undefined}>
        <button type="button" className="consult-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <p className="consult-eyebrow">Book a Consultation</p>
        <h3 className="consult-title">Choose your location.</h3>
        <ul className="consult-locs">
          {locations.map((l) => (
            <li key={l.name} className="consult-loc">
              <span className="consult-loc-info">
                <span className="consult-loc-name">{l.name}</span>
                <span className="consult-loc-sub">{l.sub}</span>
              </span>
              <a className="btn aqua consult-loc-btn" href={l.url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>Book Now</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )

  return (
    <div className={`consult-wrap ${wrapClassName}`.trim()} ref={wrapRef}>
      <button
        type="button"
        ref={btnRef}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (open) { setOpen(false); return }
          if (detached && !isMobile) place()
          onOpen?.()
          setOpen(true)
        }}
      >
        <span className="cta-full">{label}</span>
        <span className="cta-short">Book now</span>
        {icon}
      </button>
      {open
        ? mounted && (isMobile || detached)
          ? createPortal(panel(isMobile ? undefined : pos ?? undefined), document.body)
          : panel()
        : prerender && <div hidden>{panel()}</div>}
    </div>
  )
}
