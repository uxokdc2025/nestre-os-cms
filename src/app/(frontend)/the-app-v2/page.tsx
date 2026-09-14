import React from 'react'
import type { Metadata } from 'next'
import { Block } from '@/components/RenderBlocks'
import { MindsetRing } from '@/components/MindsetRing'
import { Reveal } from '@/components/Reveal'
import { ReadingReveal } from '@/components/ReadingReveal'

// ─────────────────────────────────────────────────────────────────────────────
// /the-app-v2 — a review build of the "The App" page (v2), rebuilt from the
// UXOKDC design (github.com/mbjy121/nestre-the-app) but rendered ENTIRELY through
// our own system: our SiteHeader/SiteFooter/BottomBlur/CustomCursor come from the
// (frontend) layout, and every section is emitted by our own <Block> renderer +
// <MindsetRing>, so it picks up our tokens, sticky-framing, timeline, blur and
// cursor patterns for free. Assets live under /public/app-v2/. Noindexed.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'The App — v2 (review)',
  robots: { index: false, follow: false },
}

const A = '/app-v2'
const IOS = 'https://apps.apple.com/us/app/nestre-health-and-performance/id6443393462'
const ANDROID = 'https://play.google.com/store/apps/details?id=com.nestreapp.prod'
const img = (url: string, alt = '') => ({ url, alt })

/* eslint-disable @typescript-eslint/no-explicit-any */
const blocks: Record<string, any> = {
  hero: {
    blockType: 'hero',
    eyebrow: 'The NESTRE App',
    heading: 'Your mind.\nOn your schedule.',
    body: 'Daily cognitive workouts, mental training, and Mindset Frames — deep work for the everyday, guided by your own performance data.',
    video: img(`${A}/video/app-hero.mp4`),
    background: img(`${A}/img/water.jpg`, 'Calm water'),
    ctas: [
      { label: 'Download for iOS', href: IOS, style: 'aqua' },
      { label: 'Get it on Android', href: ANDROID, style: 'outline' },
    ],
  },

  showcase: {
    blockType: 'appShowcase',
    eyebrow: 'On every screen',
    heading: 'The whole method,\nin your pocket.',
    body: 'Frames, training and your Mindset Profile — the full NESTRE method, wherever the day takes you.',
    tags: [{ label: 'Everyday Life' }, { label: 'Performance' }, { label: 'Health & Wellness' }],
    phones: [
      { image: img(`${A}/appshots/appshot-1.png`, 'Frames — Everyday Life') },
      { image: img(`${A}/appshots/appshot-3.png`, 'Player — Trying Something New') },
      { image: img(`${A}/appshots/appshot-5.png`, 'Frames — Health & Wellness') },
    ],
  },

  between: {
    blockType: 'steps',
    theme: 'navy',
    eyebrow: 'Cognitive training & mental fitness',
    heading: 'For the life between sessions.',
    body: 'A companion for the everyday — small, repeatable practices that keep your mind sharp, steady, and ready for whatever the day asks.',
    steps: [
      { image: img(`${A}/appshots/appshot-1.png`), kicker: 'Train', title: 'Give your mind a practice.', body: 'Short daily cognitive workouts that build focus and clarity — a few minutes, every day.' },
      { image: img(`${A}/appshots/appshot-3.png`), kicker: 'Reflect', title: 'Put words to your experience.', body: 'Capture what you feel and think, and watch patterns surface over time.' },
      { image: img(`${A}/appshots/appshot-4.png`), kicker: 'Reframe', title: 'Make space for perspective.', body: 'Guided Mindset Frames help you step back and see the moment from a new angle.' },
    ],
  },

  lens: {
    blockType: 'steps',
    theme: 'navy',
    eyebrow: 'Mindset Frames',
    heading: 'A new lens. A little\nmore possibility.',
    body: "Sometimes an idea gives you a different way into the day. Explore curated collections built around who you are and where you want to go.",
    steps: [
      { image: img(`${A}/personas/persona-deepthinker.jpg`), title: 'Changing Your Lens', body: "Reframe a stuck moment and find a way forward you hadn't considered." },
      { image: img(`${A}/personas/persona-baseline.jpg`), title: 'Letting Go', body: 'Put down what you are carrying so the next moment has room to arrive.' },
    ],
  },

  reset: {
    blockType: 'featureRows',
    theme: 'paper',
    eyebrow: 'A moment to pause',
    heading: 'Room to reset\nyour attention.',
    body: 'Guided Mindset Frames make space to come back to yourself — a small, unhurried reset you can take at the edge of the day.',
    image: img(`${A}/img/water.jpg`, 'Still water'),
  },

  start: {
    blockType: 'steps',
    theme: 'navy',
    eyebrow: 'Your practice, your pace',
    heading: 'Start with today.\nKeep making room.',
    steps: [
      { image: img(`${A}/appshots/appshot-2.png`), kicker: '01 · Check in', title: 'Get to know your mind.', body: 'Begin with your NESTRE Score and see where you are today — your starting point, not your limit.' },
      { image: img(`${A}/appshots/appshot-5.png`), kicker: '02 · Train', title: "Meet the moment you're in.", body: 'A short daily practice, matched to how you are reading right now, keeps momentum going.' },
      { image: img(`${A}/appshots/appshot-3.png`), kicker: '03 · Return', title: 'Make it part of your life.', body: 'Come back tomorrow — and watch your Mindset Profile become unmistakably yours.' },
    ],
  },

  faq: {
    blockType: 'faq',
    theme: 'paper',
    eyebrow: 'Before you download',
    heading: 'Questions, answered.',
    items: [
      { q: 'Can I use the app without a coach?', a: 'Yes. The app is built to guide you on its own — your daily practice, Frames, and Mindset Profile are all self-serve. A NeuroTrainer is there when you want more.' },
      { q: 'Is the training I do a class?', a: "No — it's a personal practice. A few minutes a day, on your schedule, built around your own performance data rather than a fixed curriculum." },
      { q: 'Does the app sync across my devices?', a: 'Your progress and Mindset Profile follow you across iOS and Android, so you can pick up wherever you are.' },
      { q: 'Where can I see my performance?', a: 'Everything lives in your profile — your NESTRE Score, history, and the Mindset Profile that reshapes as you train.' },
    ],
  },

  closing: {
    blockType: 'closingCta',
    background: img(`${A}/img/sunrise.jpg`, 'Sunrise over a city'),
    heading: 'More of you.\nIn the moments that matter.',
    body: 'Bring cognitive fitness into your everyday. Start with your mind — your curiosity, and the best of you.',
    ctas: [{ label: 'Download for iOS', href: IOS, style: 'aqua' }, { label: 'Get it on Android', href: ANDROID, style: 'outline' }],
  },
}

// Shared body so /the-app and /the-app-v2 render the identical, refined layout.
// The Mindset Profile ring sits directly UNDER the app (phone) showcase.
export function TheAppBody() {
  return (
    <main id="main">
      <Block block={blocks.hero} />
      <div id="next" className="scroll-anchor" aria-hidden />
      <Block block={blocks.showcase} />
      <MindsetRing eyebrow="Your Mindset Profile" heading="No two minds read the same." />
      <Block block={blocks.reset} />
      <Block block={blocks.start} />
      <Block block={blocks.faq} />
      <Block block={blocks.closing} />
      <Reveal />
      <ReadingReveal />
    </main>
  )
}

export default function TheAppV2() {
  return <TheAppBody />
}
