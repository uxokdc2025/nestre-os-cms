'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BOOK_LOCATIONS } from '@/lib/book-training'

// "Book a Consultation" CTA that opens a location picker.
// - Desktop: a dropdown anchored under the button (absolute, closes on outside click / Esc).
// - Mobile (≤620px): a bottom drawer (sheet) portaled to <body> so it anchors to the
//   viewport, escaping the header's transformed containing block. Closes via backdrop / Esc.
// Each location has a "Book Now" CTA that opens its Acuity booking.
export function ConsultPopover({
  label = 'Book a Consultation',
  className = 'btn aqua nav-cta',
  wrapClassName = '',
  onOpen,
  listenGlobal = false,
}: {
  label?: string
  className?: string
  wrapClassName?: string
  onOpen?: () => void
  listenGlobal?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 620px)')
    const on = () => setIsMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
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
    const onClick = (e: MouseEvent) => { if (!isMobile && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open, isMobile])

  const panel = (
    <>
      <div className="consult-backdrop" aria-hidden onClick={() => setOpen(false)} />
      <div className="consult-pop" role="dialog" aria-modal="true" aria-label="Book a consultation">
        <button type="button" className="consult-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <p className="consult-eyebrow">Book a Consultation</p>
        <h3 className="consult-title">Choose your location.</h3>
        <ul className="consult-locs">
          {BOOK_LOCATIONS.map((l) => (
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
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen((o) => { const next = !o; if (next) onOpen?.(); return next }) }}
      >
        <span className="cta-full">{label}</span>
        <span className="cta-short">Book now</span>
      </button>
      {open && (isMobile && mounted ? createPortal(panel, document.body) : panel)}
    </div>
  )
}
