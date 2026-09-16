'use client'

import React from 'react'

// Footer "Book a Consultation" — opens the consult drawer (the same popover the
// header opens) instead of navigating. Falls back to the /book-a-consultation page
// for no-JS / middle-click / new-tab.
export function ConsultFooterLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="/book-a-consultation"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('nestre:open-consult'))
      }}
    >
      {children}
    </a>
  )
}
