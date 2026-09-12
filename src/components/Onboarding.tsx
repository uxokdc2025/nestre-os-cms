'use client'
import React, { useEffect, useRef, useState } from 'react'

type Q = { key: string; label: string; hint: string }
type Attach = { q: string; url: string }

export function Onboarding({ token }: { token: string }) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('Welcome onboarding')
  const [intro, setIntro] = useState('')
  const [questions, setQuestions] = useState<Q[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [attachments, setAttachments] = useState<Attach[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'done' | 'error'>('loading')
  const [listening, setListening] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const recog = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    fetch(`/api/onboarding/${token}`).then((r) => r.json()).then((d) => {
      if (d.error) { setStatus('error'); return }
      setName(d.name || ''); setTitle(d.title || 'Welcome onboarding'); setIntro(d.intro || '')
      setQuestions(d.questions || []); setAnswers(d.answers || {}); setAttachments(d.attachments || [])
      setStatus(d.status === 'completed' ? 'done' : 'ready')
    }).catch(() => setStatus('error'))
  }, [token])

  const save = async (complete = false, next = answers, att = attachments) => {
    setSaving(true)
    try { await fetch(`/api/onboarding/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: next, attachments: att, complete }) }) } finally { setSaving(false) }
  }

  const voice = (key: string) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) { alert('Voice input isn’t supported in this browser — please type instead.'); return }
    if (listening) { recog.current?.stop(); return }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.continuous = true
    const base = answers[key] ? answers[key].trim() + ' ' : ''
    r.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setAnswers((a) => ({ ...a, [key]: base + t })) } // eslint-disable-line @typescript-eslint/no-explicit-any
    r.onend = () => { setListening(null); setAnswers((a) => { save(false, a); return a }) }
    r.onerror = () => setListening(null)
    recog.current = r; r.start(); setListening(key)
  }

  const attach = async (key: string, file?: File | null) => {
    if (!file) return
    const sign = await fetch(`/api/onboarding/${token}/upload`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name }) }).then((r) => r.json())
    if (!sign.uploadUrl) return
    const put = await fetch(sign.uploadUrl, { method: 'PUT', headers: { 'content-type': file.type, 'x-upsert': 'true' }, body: file })
    if (!put.ok) return
    const att = [...attachments, { q: key, url: sign.publicUrl }]
    setAttachments(att); save(false, answers, att)
  }

  if (status === 'loading') return <div className="ob-wrap"><p className="ob-muted">Loading…</p></div>
  if (status === 'error') return <div className="ob-wrap"><h1>Link not found</h1><p className="ob-muted">This onboarding link isn’t valid. Please check with your NESTRE admin.</p></div>
  if (status === 'done') return (
    <div className="ob-wrap ob-center">
      <div className="ob-badge">✓</div>
      <h1>Thank you{name ? `, ${name.split(' ')[0]}` : ''}.</h1>
      <p className="ob-muted">Your onboarding is complete. The NESTRE team has everything they need to get you set up.</p>
      <button className="ob-btn ghost" onClick={() => setStatus('ready')}>Review or edit my answers</button>
    </div>
  )

  const answered = questions.filter((q) => (answers[q.key] || '').trim()).length

  return (
    <div className="ob-wrap">
      <header className="ob-head">
        <div className="ob-logo">NESTRE</div>
        <p className="ob-eyebrow">{title}</p>
        <h1>{name ? `Welcome, ${name.split(' ')[0]}.` : 'Welcome.'}</h1>
        <p className="ob-lead">{intro || 'Help us get you set up. Answer in whatever way is easiest — speak it, screenshot it, or type it.'} Everything saves as you go.</p>
      </header>

      <div className="ob-questions">
        {questions.map((q, i) => {
          const atts = attachments.filter((a) => a.q === q.key)
          return (
            <section key={q.key} className="ob-q">
              <div className="ob-q-n">{String(i + 1).padStart(2, '0')}</div>
              <div className="ob-q-body">
                <label htmlFor={q.key}>{q.label}</label>
                <p className="ob-hint">{q.hint}</p>
                <textarea id={q.key} value={answers[q.key] || ''} placeholder="Type your answer, or use the mic / screenshot…"
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))} onBlur={() => save(false)} rows={3} />
                <div className="ob-q-tools">
                  <button className={`ob-tool${listening === q.key ? ' rec' : ''}`} onClick={() => voice(q.key)} type="button">
                    {listening === q.key ? '● Listening… tap to stop' : '🎤 Speak'}
                  </button>
                  <label className="ob-tool">
                    📎 Screenshot
                    <input type="file" accept="image/*" hidden onChange={(e) => { attach(q.key, e.target.files?.[0]); e.currentTarget.value = '' }} />
                  </label>
                  {atts.length > 0 && <span className="ob-attcount">{atts.length} attached</span>}
                </div>
                {atts.length > 0 && <div className="ob-thumbs">{atts.map((a, j) => <img key={j} src={a.url} alt="attachment" />)}</div>}
              </div>
            </section>
          )
        })}
      </div>

      <footer className="ob-foot">
        <span className="ob-muted">{answered}/{questions.length} answered{saving ? ' · saving…' : ' · saved'}</span>
        <button className="ob-btn" onClick={() => save(true).then(() => setStatus('done'))} disabled={saving}>Finish onboarding</button>
      </footer>
    </div>
  )
}
