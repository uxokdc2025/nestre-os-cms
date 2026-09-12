'use client'

import { useState } from 'react'
import { Puck } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { config } from '@/puck.config'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function Editor({ slug, initialData }: { slug: string; initialData: any }) {
  const [status, setStatus] = useState('')

  const save = async (data: any) => {
    setStatus('Publishing…')
    const r = await fetch('/api/puck-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, data }),
    })
    setStatus(r.ok ? 'Published ✓' : 'Save failed')
    setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div style={{ height: '100vh' }}>
      {status && (
        <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 9999, background: '#10212a', color: '#98d6d3', padding: '8px 14px', borderRadius: 8, fontSize: 14 }}>
          {status}
        </div>
      )}
      <Puck config={config} data={initialData} onPublish={save} />
    </div>
  )
}
