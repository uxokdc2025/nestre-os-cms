/* Client-side Payload REST helpers for the unified Studio. Same-origin, so the
   logged-in cookie authorizes every call (access control still applies). */
/* eslint-disable @typescript-eslint/no-explicit-any */

const json = { 'Content-Type': 'application/json' }

export async function list(collection: string, params = ''): Promise<any[]> {
  const r = await fetch(`/api/${collection}?limit=200&depth=1${params}`, { credentials: 'same-origin' })
  if (!r.ok) return []
  const d = await r.json()
  return d.docs || []
}

export async function getOne(collection: string, id: string | number): Promise<any> {
  const r = await fetch(`/api/${collection}/${id}?depth=1`, { credentials: 'same-origin' })
  return r.ok ? r.json() : null
}

export async function create(collection: string, data: any): Promise<{ ok: boolean; doc?: any; error?: string }> {
  const r = await fetch(`/api/${collection}`, { method: 'POST', headers: json, credentials: 'same-origin', body: JSON.stringify(data) })
  const d = await r.json().catch(() => ({}))
  return r.ok ? { ok: true, doc: d.doc } : { ok: false, error: d?.errors?.[0]?.message || d?.message || 'Save failed' }
}

export async function update(collection: string, id: string | number, data: any): Promise<{ ok: boolean; doc?: any; error?: string }> {
  const r = await fetch(`/api/${collection}/${id}`, { method: 'PATCH', headers: json, credentials: 'same-origin', body: JSON.stringify(data) })
  const d = await r.json().catch(() => ({}))
  return r.ok ? { ok: true, doc: d.doc } : { ok: false, error: d?.errors?.[0]?.message || d?.message || 'Save failed' }
}

export async function remove(collection: string, id: string | number): Promise<boolean> {
  const r = await fetch(`/api/${collection}/${id}`, { method: 'DELETE', credentials: 'same-origin' })
  return r.ok
}

export async function getGlobal(slug: string): Promise<any> {
  const r = await fetch(`/api/globals/${slug}?depth=1`, { credentials: 'same-origin' })
  return r.ok ? r.json() : null
}

export async function updateGlobal(slug: string, data: any): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`/api/globals/${slug}`, { method: 'POST', headers: json, credentials: 'same-origin', body: JSON.stringify(data) })
  const d = await r.json().catch(() => ({}))
  return r.ok ? { ok: true } : { ok: false, error: d?.errors?.[0]?.message || d?.message || 'Save failed' }
}

/** Natural-language edit of a global or collection doc via the AI endpoint. */
export async function askDoc(scope: 'global' | 'collection', slug: string, instruction: string, id?: string | number) {
  const r = await fetch('/api/studio/edit-doc', { method: 'POST', headers: json, credentials: 'same-origin', body: JSON.stringify({ scope, slug, id, instruction }) })
  return r.json()
}
