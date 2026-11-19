'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ArrowIcon } from './ArrowIcon'
import {
  BOOKINGS_URL,
  SCHEDULE_LABEL,
  consultSurveySrc,
  isConsultSurvey,
  type SurveyCompletePayload,
} from '@/lib/survey-widget'

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

/* ===== Post-quiz thank-you panel =================================== */

// The copy LeadConnector rendered in its own thank-you state, handed over by the
// watcher inside the proxied quiz (lib/survey-widget.ts → 'nestre-survey-complete').
type SurveyComplete = Omit<SurveyCompletePayload, 'type'>

const FALLBACK_HEADING = 'Let’s explore what’s available to you.'
const FALLBACK_PROMPT = 'Schedule a call with our consultant below'

/** Only strings, trimmed and length-capped — the payload crosses postMessage. */
function text(v: unknown) {
  return typeof v === 'string' ? v.slice(0, 400).trim() : ''
}

// The quiz's own line reads "…consultant here:" because its link sat inline right
// after it. Ours is a button on its own line underneath, so say "below".
function promptCopy(prompt: string) {
  const t = prompt.replace(/\s*\bhere\b\s*:?\s*$/i, ' below').replace(/\s*:\s*$/, '').trim()
  return t || FALLBACK_PROMPT
}

// Replaces the quiz once it is submitted: the dynamic thank-you copy plus the one
// thing that has to be unmissable, a full-size Schedule a Call button. The button
// is a plain link in the top document — Microsoft Bookings sends a `frame-ancestors`
// CSP, so it can only ever be opened by a top-level navigation, never in an iframe.
function SurveyThanks({ data, panelRef }: { data: SurveyComplete; panelRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="survey-thanks">
      {/* Focused when it appears, so the swap from quiz to thank-you is announced. */}
      <div className="survey-thanks-inner" ref={panelRef} tabIndex={-1}>
        <h3 className="survey-thanks-title">{data.heading || FALLBACK_HEADING}</h3>
        {data.interestValue ? (
          <p className="survey-thanks-interest">
            {(data.interestLabel || 'Your interest is').replace(/\s*:\s*$/, '')}{' '}
            <strong>{data.interestValue}</strong>
          </p>
        ) : null}
        <p className="survey-thanks-prompt">{promptCopy(data.prompt)}</p>
        <a className="btn aqua survey-thanks-cta" href={BOOKINGS_URL}>
          {SCHEDULE_LABEL}
          <ArrowIcon />
        </a>
      </div>
    </div>
  )
}

// A CTA button that opens a modal embedding a LeadConnector survey. Reused by the
// get-started ad pages (GetStartedBody) and by any Puck CTA given a survey id.
// Closes via the X, Esc or a backdrop click; focus returns to the button. The
// iframe carries the survey id so form_embed.js auto-sizes it (no inner scrollbar);
// the modal body scrolls if the survey is taller than the viewport (no clipping).
// Once the quiz is submitted the intro and the quiz are hidden and SurveyThanks
// takes the whole body; closing the dialog puts it back to the quiz.
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
  const [complete, setComplete] = useState<SurveyComplete | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const thanksRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)
  const headingId = useId()

  useEffect(() => { setMounted(true) }, [])

  // Closing always drops the thank-you state, so the next open starts at the quiz
  // (the dialog is unmounted while closed, so the iframe reloads from scratch).
  const close = useCallback(() => { setOpen(false); setComplete(null) }, [])

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
      // The quiz is hidden (not unmounted) once submitted, so skip anything no
      // longer on screen — otherwise first/last land on the hidden iframe.
      const focusable = Array.from(
        dlg.querySelectorAll<HTMLElement>('button, a[href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
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

  // The proxied quiz posts 'nestre-survey-complete' from our own origin when
  // LeadConnector renders its thank-you state (lib/survey-widget.ts). Accept it
  // only from this dialog's own iframe.
  useEffect(() => {
    if (!open) return
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as Record<string, unknown> | null
      if (!d || d.type !== 'nestre-survey-complete') return
      const frameWin = frameRef.current?.contentWindow
      if (frameWin && e.source !== frameWin) return
      setComplete({
        heading: text(d.heading),
        interestLabel: text(d.interestLabel),
        interestValue: text(d.interestValue),
        prompt: text(d.prompt),
      })
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [open])

  // The quiz can leave the body scrolled well down the iframe; the thank-you panel
  // centres itself in the body, so start it at the top and move focus into it.
  useEffect(() => {
    if (!complete) return
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    thanksRef.current?.focus()
  }, [complete])

  // Return focus to the trigger when the dialog closes (not on first mount).
  useEffect(() => {
    if (wasOpen.current && !open) btnRef.current?.focus()
    wasOpen.current = open
  }, [open])

  const modal = (
    <>
      <div className="survey-backdrop" aria-hidden onClick={close} />
      <div className="survey-dialog" role="dialog" aria-modal="true" aria-labelledby={headingId} ref={dialogRef}>
        <div className="survey-dialog-head">
          <h2 id={headingId} className="survey-dialog-title">{title}</h2>
          <button type="button" ref={closeRef} className="survey-close" aria-label="Close" onClick={close}>×</button>
        </div>
        <div className={`survey-dialog-body${complete ? ' is-complete' : ''}`} ref={bodyRef}>
          {isConsultSurvey(surveyId) && !complete && (
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
          {/* Hidden rather than unmounted after submit: the iframe keeps its document
              and SurveyTurnstile keeps window.__nestreSurveyTurnstile installed. */}
          <div className="survey-quiz" hidden={Boolean(complete)}>
            <iframe
              className="survey-frame"
              ref={frameRef}
              src={consultSurveySrc(surveyId)}
              id={surveyId}
              title="survey"
              scrolling="no"
              data-cookie-consent="true"
              data-cookie-consent-provider="auto"
            />
            {isConsultSurvey(surveyId) && <SurveyTurnstile />}
          </div>
          {complete && <SurveyThanks data={complete} panelRef={thanksRef} />}
        </div>
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
        onClick={() => { setComplete(null); setOpen(true) }}
      >
        {label}
        {icon}
      </button>
      {open && mounted ? createPortal(modal, document.body) : null}
    </>
  )
}
