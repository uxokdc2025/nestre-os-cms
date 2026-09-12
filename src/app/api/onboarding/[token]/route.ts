import { NextResponse } from 'next/server'
import { getByToken, saveAnswers, questionsFor } from '@/lib/onboarding'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Public, token-gated: the onboarding link is the credential (no login).
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await getByToken(token)
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const tpl = questionsFor(row.template)
  return NextResponse.json({
    name: row.name || '', status: row.status, template: row.template,
    title: tpl.title, intro: tpl.intro, questions: tpl.questions,
    answers: row.answers || {}, attachments: row.attachments || [],
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const row = await getByToken(token)
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const saved = await saveAnswers(token, body.answers || {}, body.attachments, !!body.complete)
  return NextResponse.json({ ok: true, status: saved?.status })
}
