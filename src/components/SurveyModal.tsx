'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
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
}: {
  surveyId: string
  label: string
  className?: string
  title?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
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

  const modal = (
    <>
      <div className="survey-backdrop" aria-hidden onClick={close} />
      <div className="survey-dialog" role="dialog" aria-modal="true" aria-labelledby={headingId} ref={dialogRef}>
        <div className="survey-dialog-head">
          <h2 id={headingId} className="survey-dialog-title">{title}</h2>
          <button type="button" ref={closeRef} className="survey-close" aria-label="Close" onClick={close}>×</button>
        </div>
        <div className="survey-dialog-body">
          {isConsultSurvey(surveyId) && (
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
          />
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
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && mounted ? createPortal(modal, document.body) : null}
    </>
  )
}
