import type { CollectionConfig } from 'payload'
import { anyone, isLoggedIn } from '../access'

/** Press / news mentions — editable in the CMS, rendered on /news, and emitted
 *  as NewsArticle JSON-LD for SEO + AI answer engines. */
export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News item', plural: 'News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'source', 'date', 'published'],
    group: 'Content',
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'type', type: 'select', defaultValue: 'news', options: [
      { label: 'News', value: 'news' }, { label: 'Event', value: 'event' },
    ], admin: { description: 'Events float their date, time & location.' } },
    { name: 'category', type: 'text', admin: { description: 'Badge, e.g. Partnership, Research, Event' } },
    { name: 'source', type: 'text', admin: { description: 'Publication / partner name, e.g. AdventHealth' } },
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'startsAt', type: 'date', admin: { condition: (d) => d?.type === 'event', date: { pickerAppearance: 'dayAndTime' }, description: 'Event start (date & time)' } },
    { name: 'venue', type: 'text', admin: { condition: (d) => d?.type === 'event', description: 'Event location' } },
    { name: 'summary', type: 'textarea' },
    { name: 'url', type: 'text', admin: { description: 'External article / event link' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
}
