import type { CollectionConfig } from 'payload'
import { blocks } from '../blocks'
import { anyone, isLoggedIn } from '../access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Marketing pages, assembled from blocks. "/" is the home page.',
  },
  access: {
    read: anyone,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  // Drafts/versions disabled: content is edited live via the AI Studio + admin,
  // and the version tables were left inconsistent by direct-SQL seeding. Edits
  // write straight to the published tables. (Re-introduce drafts later via a
  // clean migration if a preview-before-publish flow is wanted.)
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL path. Use "home" for the front page.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks,
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', admin: { description: 'Falls back to the page title.' } },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
