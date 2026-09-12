import type { GlobalConfig } from 'payload'
import { anyone, isLoggedIn } from './access'

export const Nav: GlobalConfig = {
  slug: 'nav',
  access: { read: anyone, update: isLoggedIn },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Nav links',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', admin: { description: 'Anchor (#how) or URL.' } },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: { read: anyone, update: isLoggedIn },
  fields: [
    { name: 'tagline', type: 'textarea' },
    { name: 'contactEmail', type: 'text' },
    { name: 'contactPhone', type: 'text' },
    { name: 'legalNote', type: 'textarea' },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text' },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text' },
          ],
        },
      ],
    },
  ],
}

export const Brand: GlobalConfig = {
  slug: 'brand',
  label: 'Brand',
  access: { read: anyone, update: isLoggedIn },
  fields: [
    { name: 'name', type: 'text', defaultValue: 'NESTRE' },
    { name: 'tagline', type: 'text' },
    { name: 'logoLight', type: 'upload', relationTo: 'media', label: 'Logo (for dark backgrounds)' },
    { name: 'logoDark', type: 'upload', relationTo: 'media', label: 'Logo (for light backgrounds)' },
    {
      name: 'colors',
      type: 'array',
      label: 'Color tokens',
      fields: [
        { name: 'token', type: 'text', admin: { description: 'e.g. navy, aqua, paper' } },
        { name: 'value', type: 'text', admin: { description: 'hex, e.g. #081c26' } },
      ],
    },
    { name: 'radius', type: 'text', label: 'Button/card corner radius', admin: { description: 'e.g. 999px (pill), 14px, 4px' } },
    { name: 'headingFont', type: 'text', label: 'Heading font (Google Fonts family)', admin: { description: 'e.g. Instrument Sans, Fraunces' } },
    { name: 'bodyFont', type: 'text', label: 'Body font (Google Fonts family)' },
  ],
}

export const globals: GlobalConfig[] = [Nav, Footer, Brand]
