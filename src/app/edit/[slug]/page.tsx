import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Editor } from './Editor'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin')

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, draft: true, depth: 0, limit: 1 })
  const page = res.docs[0] as any
  if (!page) redirect('/admin')

  const data = {
    content: (page.layout || []).map((b: any) => ({
      type: b.blockType,
      props: { ...b, id: b.id || randomUUID() },
    })),
    root: { props: {} },
  }

  return <Editor slug={slug} initialData={data} />
}
