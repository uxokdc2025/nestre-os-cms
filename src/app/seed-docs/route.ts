import { getPayload } from 'payload'
import config from '@/payload.config'
import { PRIVACY } from '@/lib/privacy-content'
import { TERMS } from '@/lib/terms-content'
import { HELP } from '@/lib/help-content'
import { docToLexical } from '@/lib/lexical'

export const dynamic = 'force-dynamic'

// One-off admin seed: create/refresh the CMS Page records for the legal/support
// docs so they become editable in the Studio. Guarded by a key. Safe to re-run
// (upserts by slug). Remove this route after the pages exist.
const KEY = 'nestre-seed-2026'
const DOCS = [
  { slug: 'privacy', title: 'Privacy Policy', blocks: PRIVACY },
  { slug: 'terms', title: 'Terms & Conditions', blocks: TERMS },
  { slug: 'help', title: 'Help & Support', blocks: HELP },
]

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get('key') !== KEY) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const payload = await getPayload({ config: await config })
    const out: string[] = []
    for (const d of DOCS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {
        title: d.title,
        slug: d.slug,
        layout: [{ blockType: 'richText', content: docToLexical(d.blocks) }],
      }
      const existing = await payload.find({ collection: 'pages', where: { slug: { equals: d.slug } }, limit: 1 })
      if (existing.docs[0]) {
        await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
        out.push(`${d.slug}: updated`)
      } else {
        await payload.create({ collection: 'pages', data })
        out.push(`${d.slug}: created`)
      }
    }
    return Response.json({ ok: true, out })
  } catch (e: unknown) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
