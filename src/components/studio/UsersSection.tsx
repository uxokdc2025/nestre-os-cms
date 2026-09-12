'use client'
import React, { useEffect, useState } from 'react'
import { Field, TextInput, SectionHead, Btn } from './ui'
import * as api from './api'

type User = { id?: number; name?: string; email?: string; role?: 'admin' | 'editor'; password?: string; template?: 'team' | 'founder' }

export function UsersSection({ toast }: { toast: (s: string) => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [creating, setCreating] = useState<User | null>(null)
  const [busy, setBusy] = useState(false)
  const [invite, setInvite] = useState<{ email: string; url: string; token: string } | null>(null)

  const load = () => api.list('users').then(setUsers)
  useEffect(() => { load() }, [])

  const makeOnboarding = async (u: { id?: number; name?: string; email?: string; role?: string; template?: string }) => {
    const r = await fetch('/api/studio/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ name: u.name, email: u.email, role: u.role, userId: u.id, template: u.template }) }).then((x) => x.json()).catch(() => null)
    if (r?.ok) setInvite({ email: u.email || '', url: r.url, token: r.token })
    return r
  }
  const copyLink = (url: string) => { navigator.clipboard?.writeText(url).then(() => toast('Link copied ✓')) }
  const sendEmail = async (token: string) => {
    const r = await fetch('/api/studio/send-onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ token }) }).then((x) => x.json()).catch(() => null)
    if (r?.ok) toast(r.message || 'Email sent ✓')
    else if (r?.error === 'email_not_configured') toast('Email isn’t set up yet — copy the link instead.')
    else toast(r?.error || 'Send failed')
  }

  const changeRole = async (u: User, role: 'admin' | 'editor') => {
    const res = await api.update('users', u.id!, { role })
    if (res.ok) { toast('Role updated ✓'); load() } else toast(res.error || 'Failed')
  }
  const del = async (u: User) => {
    if (!window.confirm(`Remove ${u.email}? They lose access immediately.`)) return
    if (await api.remove('users', u.id!)) { toast('User removed'); load() }
  }
  const createUser = async () => {
    if (!creating?.email || !creating.password) return
    setBusy(true)
    const res = await api.create('users', { email: creating.email, name: creating.name, role: creating.role || 'editor', password: creating.password })
    if (res.ok) {
      await makeOnboarding({ id: res.doc?.id, name: creating.name, email: creating.email, role: creating.role || 'editor', template: creating.template || 'team' })
      toast('User added ✓'); setCreating(null); load()
    } else toast(res.error || 'Could not create user')
    setBusy(false)
  }

  return (
    <div className="sf-page">
      <SectionHead title="Users & roles" sub="Admins manage everything; Editors manage content only"
        action={<Btn onClick={() => setCreating({ role: 'editor' })}>+ Add user</Btn>} />

      {invite && (
        <div className="sf-invite">
          <div>
            <b>Onboarding ready for {invite.email || 'the new user'}</b>
            <p>Send them their personal onboarding — they can speak, screenshot, or type their answers.</p>
            <code className="sf-invite-link">{invite.url}</code>
          </div>
          <div className="sf-invite-actions">
            <button className="sf-btn ghost" onClick={() => copyLink(invite.url)}>Copy link</button>
            <Btn onClick={() => sendEmail(invite.token)}>Send email</Btn>
            <button className="sf-iconbtn" onClick={() => setInvite(null)} aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      {creating && (
        <div className="sf-form sf-inline-form">
          <h3 className="sf-inline-title">New user</h3>
          <div className="sf-row">
            <Field label="Name"><TextInput value={creating.name || ''} onChange={(e) => setCreating({ ...creating, name: e.target.value })} /></Field>
            <Field label="Email"><TextInput type="email" value={creating.email || ''} onChange={(e) => setCreating({ ...creating, email: e.target.value })} /></Field>
          </div>
          <div className="sf-row">
            <Field label="Role">
              <select className="sf-input" value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value as any })}> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                <option value="editor">Editor — edit content</option>
                <option value="admin">Admin — full control</option>
              </select>
            </Field>
            <Field label="Temporary password" hint="They can change it later"><TextInput type="text" value={creating.password || ''} onChange={(e) => setCreating({ ...creating, password: e.target.value })} /></Field>
          </div>
          <Field label="Onboarding" hint="Founder = Tommy’s vision-capture questions; Team = role/tools/pain-points">
            <select className="sf-input" value={creating.template || 'team'} onChange={(e) => setCreating({ ...creating, template: e.target.value as any })}> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
              <option value="team">Team member (marketing, creative, IT…)</option>
              <option value="founder">Founder — Tommy’s vision capture</option>
            </select>
          </Field>
          <div className="sf-actions">
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setCreating(null)}>Cancel</Btn>
            <Btn onClick={createUser} disabled={busy || !creating.email || !creating.password}>{busy ? 'Creating…' : 'Create user'}</Btn>
          </div>
        </div>
      )}

      <div className="sf-list">
        {users.map((u) => (
          <div key={u.id} className="sf-userrow">
            <div className="sf-avatar">{(u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>
            <div className="sf-userinfo">
              <div className="sf-user-name">{u.name || u.email}</div>
              <div className="sf-user-email">{u.email}</div>
            </div>
            <button className="sf-btn ghost sf-onb-btn" onClick={() => makeOnboarding(u)} title="Create / resend onboarding">Onboarding</button>
            <select className="sf-rolepick" value={u.role} onChange={(e) => changeRole(u, e.target.value as any)}> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <button className="sf-iconbtn" onClick={() => del(u)} title="Remove user" aria-label="Remove">✕</button>
          </div>
        ))}
      </div>
      <p className="sf-note">Two roles by design — <b>Admin</b> (content, settings, users) and <b>Editor</b> (content only). Change anyone’s role from the dropdown.</p>
    </div>
  )
}
