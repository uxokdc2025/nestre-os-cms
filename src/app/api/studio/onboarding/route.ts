import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { createOnboarding, listForUser } from '@/lib/onboarding'
import { SITE_URL } from '@/lib/seo'

export const runtime = 'nodejs'

async function auth() {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return user
}

/** GET ?userId= → onboarding records for a user. */
export async function GET(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const userId = Number(new URL(req.url).searchParams.get('userId'))
  if (!userId) return NextResponse.json({ items: [] })
  const items = (await listForUser(userId)).map((r) => ({ ...r, url: `${SITE_URL}/welcome/${r.token}` }))
  return NextResponse.json({ items })
}

/** POST { name, email, role, userId } → create an onboarding + its link. */
export async function POST(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { name, email, role, userId, template } = await req.json()
  const { token, template: tpl } = await createOnboarding({ name, email, role, userId, template })
  return NextResponse.json({ ok: true, token, template: tpl, url: `${SITE_URL}/welcome/${token}` })
}
