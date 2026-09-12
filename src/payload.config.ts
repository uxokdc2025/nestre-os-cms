import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { supabaseStorageAdapter } from './storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { News } from './collections/News'
import { globals } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    theme: 'dark',
    meta: {
      titleSuffix: '— Nestre CMS',
      icons: [{ rel: 'icon', type: 'image/png', url: '/nestre-mark-white.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
      beforeDashboard: ['/components/admin/DashboardBanner'],
      afterNavLinks: ['/components/admin/StudioLink'],
      providers: ['/components/admin/AdminAI'],
    },
  },
  collections: [Users, Media, Pages, News],
  globals,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '', max: 3, idleTimeoutMillis: 10000, allowExitOnIdle: true },
    schemaName: 'cms',
  }),
  sharp,
  localization: {
    locales: ['en'],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [
    mcpPlugin({}),
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: supabaseStorageAdapter,
          disableLocalStorage: true,
        },
      },
    }),
  ],
})
