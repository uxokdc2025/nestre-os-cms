import { createClient } from '@supabase/supabase-js'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'

// Direct Supabase Storage adapter (no S3 keys needed — uses the secret key).
// Public bucket `media`; files served from Supabase's public object URL.
const BUCKET = 'media'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const secret = process.env.SUPABASE_SECRET_KEY!

const supa = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const key = (prefix: string | undefined, filename: string) =>
  prefix ? `${prefix}/${filename}` : filename

export const supabaseStorageAdapter: Adapter = ({ prefix }) => ({
  name: 'supabase',

  async handleUpload({ file }) {
    // Local seeding escape hatch: when objects are pre-uploaded out-of-band
    // (the Next server context intermittently fails supabase-js fetch), skip
    // the in-request upload so the media doc still saves. NEVER set on Vercel.
    if (process.env.SKIP_STORAGE_UPLOAD === '1') return
    const { error } = await supa.storage.from(BUCKET).upload(key(prefix, file.filename), file.buffer, {
      contentType: file.mimeType,
      upsert: true,
    })
    if (error) throw new Error(`Supabase upload failed for ${file.filename}: ${error.message}`)
  },

  async handleDelete({ filename }) {
    await supa.storage.from(BUCKET).remove([key(prefix, filename)])
  },

  generateURL({ filename }) {
    return `${url}/storage/v1/object/public/${BUCKET}/${key(prefix, filename)}`
  },

  async staticHandler(_req, { params }) {
    // Public bucket: redirect to Supabase's CDN URL so bytes never pass
    // through the serverless function (fast + reliable).
    const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${key(prefix, params.filename)}`
    return Response.redirect(publicUrl, 307)
  },
})
