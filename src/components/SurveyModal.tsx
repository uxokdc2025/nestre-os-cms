'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { consultSurveySrc, isConsultSurvey } from '@/lib/survey-widget'

/* eslint-disable @typescript-eslint/no-explicit-any */

// LeadConnector survey embed. One <script> per page (not per modal open): the
// script installs a single window 'message' listener that auto-resizes any survey
// iframe by matching its id, so iframes mounted later (when a modal opens) still
// size correctly. Guarded by a window flag so repeated opens never re-inject it.
const EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js'
function ensureEmbedScript() {
  const w = window as any
  if (w.__nestreSurveyEmbedLoaded) return
  w.__nestreSurveyEmbedLoaded = true
  const s = document.createElement('script')
  s.async = true
  s.src = EMBED_SRC
  document.body.appendChild(s)
}

// Cloudflare Turnstile for the quiz's final submit (see lib/survey-guard.ts). The
// widget lives in this dialog, under the quiz; the guard script inside the quiz
// asks for a fresh token through window.__nestreSurveyTurnstile right before the
// submit goes out, and /api/survey-guard verifies it server side. Off until the
// site key is set (NEXT_PUBLIC_TURNSTILE_SITE_KEY, inlined at build time).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
function loadTurnstile(): Promise<any> {
  const w = window as any
  if (w.turnstile) return Promise.resolve(w.turnstile)
  if (!w.__nestreTurnstileLoading) {
    w.__nestreTurnstileLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = TURNSTILE_SRC
      s.async = true
      s.onload = () => resolve(w.turnstile)
      s.onerror = reject
      document.head.appendChild(s)
    })
  }
  return w.__nestreTurnstileLoading
}

function SurveyTurnstile() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    const w = window as any
    let widgetId: string | undefined
    let token: string | null = null
    let waiters: ((t: string | null) => void)[] = []
    let cancelled = false
    const settle = (t: string | null) => { const ws = waiters; waiters = []; ws.forEach((fn) => fn(t)) }

    loadTurnstile().then((ts) => {
      if (cancelled || !boxRef.current || !ts) return
      widgetId = ts.render(boxRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: 'survey_submit',
        // Managed widget, invisible unless Cloudflare decides it needs a click.
        appearance: 'interaction-only',
        callback: (t: string) => { token = t; settle(t) },
        'expired-callback': () => { token = null; ts.reset(widgetId) },
        'error-callback': () => { token = null; settle(null) },
      })
    }).catch(() => settle(null))

    // Tokens are single-use: hand the current one over and start the next.
    w.__nestreSurveyTurnstile = () =>
      new Promise<string | null>((resolve) => {
        const take = (t: string | null) => {
          token = null
          if (widgetId !== undefined) try { w.turnstile?.reset(widgetId) } catch { /* noop */ }
          resolve(t)
        }
        if (token) return take(token)
        waiters.push(take)
        setTimeout(() => { waiters = waiters.filter((fn) => fn !== take); resolve(null) }, 15000)
      })

    return () => {
      cancelled = true
      delete w.__nestreSurveyTurnstile
      if (widgetId !== undefined) try { w.turnstile?.remove(widgetId) } catch { /* noop */ }
    }
  }, [])

  // The guard tells us when it held a submit back, so a person isn't left guessing.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === 'nestre-survey-blocked') setBlocked(true)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <div className="survey-guard">
      {TURNSTILE_SITE_KEY && <div ref={boxRef} className="survey-turnstile" />}
      {blocked && (
        <p className="survey-guard-note" role="alert">
          We couldn&apos;t verify that submission. Please complete the check above, then press Submit again.
        </p>
      )}
    </div>
  )
}

// After the quiz, "Book Discovery Call" navigates this iframe to HighLevel's
// booking app (cross-origin). The booking document itself is only ~650–705px
// and already shows its Next button; the leftover Chloe intro (~400–490px)
// above the iframe is what pushed Next below the modal-body fold (page-level
// scroll on .survey-dialog-body, not an inner iframe scrollbar).
function isBookingLocation(iframe: HTMLIFrameElement) {
  try {
    const href = iframe.contentWindow?.location.href || ''
    return /leadconnectorhq\.com\/booking|\/booking(\/|\?|$)/i.test(href)
  } catch {
    // Same-origin quiz lives at /widget/survey/:id; a cross-origin read
    // error means the iframe has navigated to HighLevel's booking app.
    return true
  }
}

// A CTA button that opens a modal embedding a LeadConnector survey. Reused by the
// get-started ad pages (GetStartedBody) and by any Puck CTA given a survey id.
// Closes via the X, Esc or a backdrop click; focus returns to the button. The
// iframe carries the survey id so form_embed.js auto-sizes it (no inner scrollbar);
// the modal body scrolls if the survey is taller than the viewport (no clipping).
export function SurveyCtaButton({
  surveyId,
  label,
  className = 'btn aqua',
  title = 'Get started',
  icon,
}: {
  surveyId: string
  label: string
  className?: string
  title?: string
  /** Trailing icon rendered after the label — e.g. <ArrowIcon/> on the ad pages. */
  icon?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bookingStep, setBookingStep] = useState(false)
  const [showScrollCue, setShowScrollCue] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const headingId = useId()

  useEffect(() => { setMounted(true) }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    ensureEmbedScript()
    // Lock background scroll and trap focus while the dialog is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab') return
      const dlg = dialogRef.current
      if (!dlg) return
      const focusable = Array.from(
        dlg.querySelectorAll<HTMLElement>('button, a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close])

  // Return focus to the trigger when the dialog closes (not on first mount).
  useEffect(() => {
    if (wasOpen.current && !open) btnRef.current?.focus()
    wasOpen.current = open
  }, [open])

  // Reset booking UI each time the dialog opens, and watch for the booking step.
  useEffect(() => {
    if (!open) {
      setBookingStep(false)
      setShowScrollCue(false)
      return
    }
    const iframe = iframeRef.current
    const onLoad = () => {
      if (iframe && isBookingLocation(iframe)) setBookingStep(true)
    }
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'nestre-survey-booking') setBookingStep(true)
    }
    iframe?.addEventListener('load', onLoad)
    window.addEventListener('message', onMsg)
    return () => {
      iframe?.removeEventListener('load', onLoad)
      window.removeEventListener('message', onMsg)
    }
  }, [open])

  // Hide the intro, then pin the booking iframe to the top of the modal body
  // so Next sits in the visible area without the user hunting for a scrollbar.
  useEffect(() => {
    if (!bookingStep) return
    const pin = () => {
      const body = bodyRef.current
      const iframe = iframeRef.current
      if (!body || !iframe) return
      const b = body.getBoundingClientRect()
      const f = iframe.getBoundingClientRect()
      body.scrollTop += f.top - b.top
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(pin))
    const t1 = window.setTimeout(pin, 50)
    const t2 = window.setTimeout(pin, 400)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [bookingStep])

  // Fallback cue only when the booking widget is still taller than the body
  // (e.g. the later calendar step). Hidden once the user scrolls to the end.
  useEffect(() => {
    if (!bookingStep) {
      setShowScrollCue(false)
      return
    }
    const body = bodyRef.current
    const iframe = iframeRef.current
    if (!body) return
    const check = () => {
      const overflow = body.scrollHeight - body.clientHeight > 16
      const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 8
      setShowScrollCue(overflow && !atBottom)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(body)
    if (iframe) ro.observe(iframe)
    body.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const t = window.setTimeout(check, 400)
    return () => {
      ro.disconnect()
      body.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearTimeout(t)
    }
  }, [bookingStep])

  const modal = (
    <>
      <div className="survey-backdrop" aria-hidden onClick={close} />
      <div className="survey-dialog" role="dialog" aria-modal="true" aria-labelledby={headingId} ref={dialogRef}>
        <div className="survey-dialog-head">
          <h2 id={headingId} className="survey-dialog-title">{title}</h2>
          <button type="button" ref={closeRef} className="survey-close" aria-label="Close" onClick={close}>×</button>
        </div>
        <div className="survey-dialog-body" ref={bodyRef}>
          {isConsultSurvey(surveyId) && !bookingStep && (
            <div className="survey-intro">
              <img
                className="survey-intro-photo"
                src="/survey/chloe-deluca.png"
                alt="Chloe DeLuca"
              />
              <h3 className="survey-intro-title">You Know Your Personality Type. But Do You Know How Your Mind Operates?</h3>
              <p className="survey-intro-sub">Four quick questions to explore your cognitive patterns— find your starting point for mind and brain fitness.</p>
            </div>
          )}
          <iframe
            className="survey-frame"
            src={consultSurveySrc(surveyId)}
            id={surveyId}
            title="survey"
            scrolling="no"
            data-cookie-consent="true"
            data-cookie-consent-provider="auto"
            ref={iframeRef}
          />
          {isConsultSurvey(surveyId) && !bookingStep && <SurveyTurnstile />}
        </div>
        {bookingStep && showScrollCue && (
          <p className="survey-scroll-cue" aria-hidden="true">
            Scroll to continue
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 6.5 8 11l4.5-4.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        )}
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {label}
        {icon}
      </button>
      {open && mounted ? createPortal(modal, document.body) : null}
    </>
  )
}
