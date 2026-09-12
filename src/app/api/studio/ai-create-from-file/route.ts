import { NextResponse } from 'next/server'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import config from '@/payload.config'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Create a collection item from an uploaded document/image + instruction.
 *  multipart form: file, collection, instruction. PDFs & images go to Claude
 *  natively; Word (.docx) is extracted to text first. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const file = form?.get('file') as File | null
  const collection = String(form?.get('collection') || 'news')
  const instruction = String(form?.get('instruction') || '')
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const buf = Buffer.from(await file.arrayBuffer())
  const type = file.type || ''
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const sys = `You create one new "${collection}" item for the NESTRE website CMS from the attached document/image.
Return ONLY a JSON object of the fields, no prose, no fences. For a news item:
{ "title": string, "source": string, "date": ISO date string, "summary": string (1-2 sentences), "url": string, "published": boolean }.
Extract a real source URL if the document contains one; otherwise set "url" to "" and "published" false. Infer the publication/source and date from the content.`

  // Build the content: image → image block, pdf → document block, docx → extracted text.
  const content: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
  const task = instruction || 'Create a news article from this.'
  if (type.startsWith('image/')) {
    content.push({ type: 'image', source: { type: 'base64', media_type: type, data: buf.toString('base64') } })
    content.push({ type: 'text', text: task })
  } else if (type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buf.toString('base64') } })
    content.push({ type: 'text', text: task })
  } else if (file.name.toLowerCase().endsWith('.docx') || type.includes('word') || type.includes('officedocument')) {
    const { value } = await mammoth.extractRawText({ buffer: buf }).catch(() => ({ value: '' }))
    if (!value.trim()) return NextResponse.json({ error: 'Could not read that Word file.' }, { status: 422 })
    content.push({ type: 'text', text: `${task}\n\nDocument text:\n${value.slice(0, 20000)}` })
  } else {
    // plain text / markdown fallback
    content.push({ type: 'text', text: `${task}\n\nDocument text:\n${buf.toString('utf-8').slice(0, 20000)}` })
  }

  let data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const msg = await anthropic.messages.create({ model: 'claude-sonnet-5', max_tokens: 1500, system: sys, messages: [{ role: 'user', content }] })
    const raw = msg.content.filter((c) => c.type === 'text').map((c: any) => c.text).join('') // eslint-disable-line @typescript-eslint/no-explicit-any
    data = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
  } catch (e) {
    return NextResponse.json({ error: 'ai_read_failed', detail: String(e) }, { status: 502 })
  }

  try {
    const doc = await payload.create({ collection: collection as any, data: data as any }) // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ ok: true, id: (doc as any).id, title: (doc as any).title, message: 'Created from document ✓' }) // eslint-disable-line @typescript-eslint/no-explicit-any
  } catch (e) {
    return NextResponse.json({ error: 'create_failed', detail: String(e) }, { status: 422 })
  }
}
