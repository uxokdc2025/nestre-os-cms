'use client'

import type { Config } from '@puckeditor/core'
import { Block } from '@/components/RenderBlocks'

/* eslint-disable @typescript-eslint/no-explicit-any */

const ctasField = {
  type: 'array' as const,
  label: 'Buttons',
  arrayFields: {
    label: { type: 'text' as const },
    href: { type: 'text' as const },
    style: {
      type: 'select' as const,
      options: [
        { label: 'Aqua', value: 'aqua' },
        { label: 'Solid', value: 'solid' },
        { label: 'Outline', value: 'outline' },
        { label: 'Link', value: 'link' },
      ],
    },
  },
  getItemSummary: (i: any) => i?.label || 'Button',
}

const themeField = {
  type: 'select' as const,
  options: [
    { label: 'Navy (dark)', value: 'navy' },
    { label: 'Paper (light)', value: 'paper' },
  ],
}

// Each Puck component maps 1:1 to a block; render reuses the site's Block.
const comp = (blockType: string, fields: any, label: string) => ({
  label,
  fields,
  render: (props: any) => <Block block={{ blockType, ...props }} />,
})

export const config: Config = {
  components: {
    hero: comp(
      'hero',
      {
        eyebrow: { type: 'text' },
        heading: { type: 'textarea' },
        subheading: { type: 'text' },
        body: { type: 'textarea' },
        ctas: ctasField,
      },
      'Hero',
    ),
    statScorecard: comp(
      'statScorecard',
      {
        theme: themeField,
        eyebrow: { type: 'text' },
        heading: { type: 'textarea' },
        body: { type: 'textarea' },
        stats: {
          type: 'array',
          arrayFields: {
            label: { type: 'text' },
            score: { type: 'number' },
            accent: { type: 'radio', options: [{ label: 'Accent', value: true }, { label: 'Normal', value: false }] },
          },
          getItemSummary: (i: any) => i?.label || 'Stat',
        },
      },
      'Stat scorecard',
    ),
    steps: comp(
      'steps',
      {
        theme: themeField,
        eyebrow: { type: 'text' },
        heading: { type: 'textarea' },
        body: { type: 'textarea' },
        steps: {
          type: 'array',
          arrayFields: { kicker: { type: 'text' }, title: { type: 'text' }, body: { type: 'textarea' } },
          getItemSummary: (i: any) => i?.title || 'Step',
        },
      },
      'Steps',
    ),
    mediaPanels: comp(
      'mediaPanels',
      {
        theme: themeField,
        eyebrow: { type: 'text' },
        heading: { type: 'textarea' },
        body: { type: 'textarea' },
        ctas: ctasField,
        panels: { type: 'array', arrayFields: { caption: { type: 'text' } }, getItemSummary: (i: any) => i?.caption || 'Panel' },
      },
      'Media panels',
    ),
    appShowcase: comp(
      'appShowcase',
      {
        eyebrow: { type: 'text' },
        heading: { type: 'textarea' },
        body: { type: 'textarea' },
        tags: { type: 'array', arrayFields: { label: { type: 'text' } }, getItemSummary: (i: any) => i?.label || 'Tag' },
        ctas: ctasField,
      },
      'App showcase',
    ),
    podcast: comp(
      'podcast',
      { heading: { type: 'textarea' }, eyebrow: { type: 'text' }, ctas: ctasField },
      'Podcast',
    ),
    closingCta: comp(
      'closingCta',
      { heading: { type: 'textarea' }, body: { type: 'textarea' }, accentLine: { type: 'text' }, ctas: ctasField },
      'Closing CTA',
    ),
  },
}
