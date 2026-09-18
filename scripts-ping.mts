import { getPayload } from 'payload'
import config from '@/payload.config'
const payload = await getPayload({ config: await config })
const r = await payload.count({ collection: 'pages' })
console.log('PING_OK pages=' + r.totalDocs)
process.exit(0)
