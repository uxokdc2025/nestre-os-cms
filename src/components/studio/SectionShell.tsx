'use client'
import React, { useEffect, useRef, useState } from 'react'

/** Pages-style split view for any section: a live site preview on the left,
 *  a control + AI panel on the right. Call `reload()` (via the ref prop) to
 *  refresh the preview after a save. */
export function SectionShell({ previewUrl, scrollToBottom, reloadSignal, children }: {
  previewUrl: string
  scrollToBottom?: boolean
  reloadSignal?: number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => { if (reloadSignal !== undefined) setKey((k) => k + 1) }, [reloadSignal])

  const onLoad = () => {
    if (!scrollToBottom) return
    try {
      const w = ref.current?.contentWindow
      const d = ref.current?.contentDocument
      if (w && d) w.scrollTo(0, d.body.scrollHeight)
    } catch { /* cross-origin guard */ }
  }

  return (
    <div className="sf-split">
      <div className="sf-preview-pane">
        <iframe key={key} ref={ref} src={previewUrl} onLoad={onLoad} title="Live preview" />
      </div>
      <aside className="sf-panel">{children}</aside>
    </div>
  )
}
