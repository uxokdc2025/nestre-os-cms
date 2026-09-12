import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Build a design system from an uploaded brand doc/image. multipart: file.
 *  Claude extracts a palette + fonts + radius → writes the Brand global. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const file = form?.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const buf = Buffer.from(await file.arrayBuffer())
  const type = file.type || ''
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const sys = `You extract a website design system from the attached brand guidelines.
Return ONLY JSON, no prose, no fences:
{ "colors": [{ "token": "navy"|"aqua"|"aqua-deep"|"paper"|"ink"|"muted"|"line"|string, "value": "#hex" }],
  "radius": "e.g. 999px | 14px | 4px" (optional),
  "headingFont": "Google Fonts family name" (optional),
  "bodyFont": "Google Fonts family name" (optional) }
Map the brand's primary dark to "navy" and "ink", its main accent to "aqua" (and a darker shade to "aqua-deep"),
its light background to "paper". Use exact hex values from the document. Keep it to 5-8 colors.`

  const content: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  const task = 'Extract the design system (colors, fonts, corner radius) from this brand document.'
  if (type.startsWith('image/')) {
    content.push({ type: 'image', source: { type: 'base64', media_type: type, data: buf.toString('base64') } }, { type: 'text', text: task })
  } else if (type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') } }, { type: 'text', text: task })
  } else if (file.name.toLowerCase().endsWith('.docx')) {
    const { value } = await mammoth.extractRawText({ buffer: buf }).catch(() => ({ value: '' }))
    content.push({ type: 'text', text: `${task}\n\n${value.slice(0, 20000)}` })
  } else {
    content.push({ type: 'text', text: `${task}\n\n${buf.toString('utf-8').slice(0, 20000)}` })
  }

  let data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const msg = await anthropic.messages.create({ model: 'claude-sonnet-5', max_tokens: 1500, system: sys, messages: [{ role: 'user', content }] })
    const raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('') // eslint-disable-line @typescript-eslint/no-explicit-any
    data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
  } catch (e) {
    return NextResponse.json({ error: 'ai_read_failed', detail: String(e) }, { status: 502 })
  }

  const patch: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  if (Array.isArray(data.colors)) patch.colors = data.colors.filter((c: any) => c?.token && c?.value) // eslint-disable-line @typescript-eslint/no-explicit-any
  if (data.radius) patch.radius = String(data.radius)
  if (data.headingFont) patch.headingFont = String(data.headingFont)
  if (data.bodyFont) patch.bodyFont = String(data.bodyFont)

  try {
    await payload.updateGlobal({ slug: 'brand', data: patch })
    return NextResponse.json({ ok: true, ...patch, message: 'Design system applied ✓' })
  } catch (e) {
    return NextResponse.json({ error: 'save_failed', detail: String(e) }, { status: 422 })
  }
}
