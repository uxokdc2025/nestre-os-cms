import type { Block, Field } from 'payload'

// Shared: a list of call-to-action buttons used across blocks.
const ctas: Field = {
  name: 'ctas',
  type: 'array',
  label: 'Buttons',
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'href', type: 'text', admin: { description: 'Anchor (#how) or URL. Leave blank for a placeholder.' } },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'aqua',
      options: [
        { label: 'Aqua (primary)', value: 'aqua' },
        { label: 'Solid ink', value: 'solid' },
        { label: 'Outline', value: 'outline' },
        { label: 'Text link', value: 'link' },
      ],
    },
  ],
}

const image = (name = 'image', label?: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'media',
})

const theme: Field = {
  name: 'theme',
  type: 'select',
  defaultValue: 'navy',
  options: [
    { label: 'Navy (dark)', value: 'navy' },
    { label: 'Paper (light)', value: 'paper' },
  ],
}

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea', required: true },
    { name: 'subheading', type: 'text' },
    { name: 'body', type: 'textarea' },
    image('background', 'Background image / video poster'),
    image('video', 'Background video (muted loop)'),
    ctas,
  ],
}

export const StatScorecard: Block = {
  slug: 'statScorecard',
  interfaceName: 'StatScorecardBlock',
  labels: { singular: 'Stat scorecard', plural: 'Stat scorecards' },
  fields: [
    theme,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    image('sideImage', 'Side image'),
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'score', type: 'number', required: true, min: 0, max: 100 },
        { name: 'accent', type: 'checkbox', defaultValue: false },
      ],
    },
    image('logoStrip', 'Logo strip image'),
  ],
}

export const StepsCarousel: Block = {
  slug: 'steps',
  interfaceName: 'StepsBlock',
  labels: { singular: 'Steps', plural: 'Steps' },
  fields: [
    theme,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    ctas,
    {
      name: 'steps',
      type: 'array',
      fields: [
        { name: 'kicker', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
        image(),
      ],
    },
  ],
}

export const MediaPanels: Block = {
  slug: 'mediaPanels',
  interfaceName: 'MediaPanelsBlock',
  labels: { singular: 'Media panels', plural: 'Media panels' },
  fields: [
    theme,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    ctas,
    {
      name: 'panels',
      type: 'array',
      fields: [{ name: 'caption', type: 'text' }, image()],
    },
  ],
}

export const AppShowcase: Block = {
  slug: 'appShowcase',
  interfaceName: 'AppShowcaseBlock',
  labels: { singular: 'App showcase', plural: 'App showcases' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    { name: 'tags', type: 'array', fields: [{ name: 'label', type: 'text' }] },
    ctas,
    { name: 'phones', type: 'array', fields: [image()] },
  ],
}

export const Podcast: Block = {
  slug: 'podcast',
  interfaceName: 'PodcastBlock',
  labels: { singular: 'Podcast', plural: 'Podcasts' },
  fields: [
    { name: 'heading', type: 'textarea' },
    { name: 'eyebrow', type: 'text' },
    image('thumbnail', 'Thumbnail / poster'),
    image('video', 'Film (mp4)'),
    ctas,
  ],
}

export const ClosingCTA: Block = {
  slug: 'closingCta',
  interfaceName: 'ClosingCtaBlock',
  labels: { singular: 'Closing CTA', plural: 'Closing CTAs' },
  fields: [
    image('background', 'Background image'),
    { name: 'heading', type: 'textarea', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'accentLine', type: 'text' },
    ctas,
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Rich text', plural: 'Rich text' },
  fields: [
    theme,
    { name: 'content', type: 'richText' },
  ],
}

export const FeatureRows: Block = {
  slug: 'featureRows',
  interfaceName: 'FeatureRowsBlock',
  labels: { singular: 'Feature rows', plural: 'Feature rows' },
  fields: [
    theme,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    image(),
    {
      name: 'rows',
      type: 'array',
      fields: [
        { name: 'label', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}

export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    theme,
    { name: 'label', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
  ],
}

export const Faq: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  fields: [
    theme,
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      fields: [{ name: 'q', type: 'text' }, { name: 'a', type: 'textarea' }],
    },
  ],
}

export const Locations: Block = {
  slug: 'locations',
  interfaceName: 'LocationsBlock',
  labels: { singular: 'Locations', plural: 'Locations' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'heading', type: 'textarea' },
    { name: 'body', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'region', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'address', type: 'textarea' },
        { name: 'cta', type: 'text' },
        image(),
      ],
    },
  ],
}

export const blocks: Block[] = [
  Hero,
  StatScorecard,
  StepsCarousel,
  MediaPanels,
  AppShowcase,
  Podcast,
  ClosingCTA,
  FeatureRows,
  Callout,
  Faq,
  Locations,
  RichTextBlock,
]
