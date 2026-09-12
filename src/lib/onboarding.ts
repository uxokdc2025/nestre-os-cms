/* Per-user onboarding stored in cms.onboarding via Payload's pg pool. Each person
   gets a token + a personal /welcome/<token>. Questions vary by template:
   'founder' (Tommy — vision/knowledge capture) vs 'team' (everyone else). */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from 'payload'
import config from '@/payload.config'
import crypto from 'crypto'

export type Question = { key: string; label: string; hint: string }

export const TEMPLATES: Record<string, { title: string; intro: string; questions: Question[] }> = {
  team: {
    title: 'Welcome onboarding',
    intro: 'Help us get you set up. Answer however is easiest — speak it, screenshot it, or type it.',
    questions: [
      { key: 'about', label: 'Who are you?', hint: 'Your background and what you do at NESTRE.' },
      { key: 'role', label: 'What’s your role?', hint: 'Your title and what you own day to day.' },
      { key: 'pain_points', label: 'What are your biggest pain points?', hint: 'Where things slow you down or break today.' },
      { key: 'tools', label: 'What tools do you use every day?', hint: 'The software, apps and systems you rely on — and which ones fight you.' },
      { key: 'impact_feature', label: 'What new tool or feature could really change your impact?', hint: 'If you could wave a wand — what would it do?' },
      { key: 'nestre_words', label: 'In your own words — what is NESTRE?', hint: 'How you’d explain NESTRE to a friend.' },
    ],
  },
  founder: {
    title: 'Founder vision capture',
    intro: 'This is the source. Everything Nestre.OS aligns to starts here — so say it your way. Speak it, screenshot it, or type it.',
    questions: [
      { key: 'nestre_real', label: 'In your own words — what is NESTRE, really?', hint: 'The business and the mission, not the app.' },
      { key: 'hir_model', label: 'How do you explain the HI-R Cognitive Performance Model?', hint: 'The way you’d teach it to someone new.' },
      { key: 'vision_drift', label: 'Where does delivery most often drift from your vision — and why?', hint: 'The gap between what you mean and what ships.' },
      { key: 'tacit_knowledge', label: 'What do you know that lives only in your head — that the team keeps needing?', hint: 'The judgment calls people always come to you for.' },
      { key: 'ai_one_thing', label: 'If AI could do one thing for NESTRE, what would it be?', hint: 'Your words — even loose is fine.' },
      { key: 'what_is_better', label: 'What does “better” mean at NESTRE — how do you know it’s working?', hint: 'The outcomes that actually matter.' },
      { key: 'audiences', label: 'Who is NESTRE for, and how do you talk to each of them differently?', hint: 'Athletes, teams, orgs, government, individuals…' },
    ],
  },
}

export const questionsFor = (template?: string) => (TEMPLATES[template || 'team'] || TEMPLATES.team)

async function pool() {
  const payload = await getPayload({ config: await config })
  return { pool: (payload as any).db?.pool as { query: (t: string, p?: any[]) => Promise<{ rows: any[] }> } }
}

export async function createOnboarding(input: { name?: string; email?: string; role?: string; userId?: number; template?: string }) {
  const { pool: p } = await pool()
  const token = crypto.randomBytes(16).toString('hex')
  const template = TEMPLATES[input.template || ''] ? input.template : 'team'
  await p.query(
    `insert into cms.onboarding (token, user_id, name, email, role, template) values ($1,$2,$3,$4,$5,$6)`,
    [token, input.userId ?? null, input.name ?? null, input.email ?? null, input.role ?? null, template],
  )
  return { token, template }
}

export async function getByToken(token: string) {
  const { pool: p } = await pool()
  const { rows } = await p.query(`select * from cms.onboarding where token=$1 limit 1`, [token])
  return rows[0] || null
}

export async function saveAnswers(token: string, answers: Record<string, string>, attachments: any[] | undefined, complete: boolean) {
  const { pool: p } = await pool()
  const sets = [`answers = answers || $1::jsonb`, `started_at = coalesce(started_at, now())`]
  const vals: any[] = [JSON.stringify(answers || {})]
  let i = 2
  if (Array.isArray(attachments)) { sets.push(`attachments = $${i++}::jsonb`); vals.push(JSON.stringify(attachments)) }
  if (complete) { sets.push(`status='completed'`, `completed_at=now()`) }
  else sets.push(`status = case when status='invited' then 'started' else status end`)
  vals.push(token)
  const { rows } = await p.query(`update cms.onboarding set ${sets.join(', ')} where token=$${i} returning *`, vals)
  return rows[0] || null
}

export async function listForUser(userId: number) {
  const { pool: p } = await pool()
  const { rows } = await p.query(`select token, status, template, completed_at from cms.onboarding where user_id=$1 order by created_at desc`, [userId])
  return rows
}
