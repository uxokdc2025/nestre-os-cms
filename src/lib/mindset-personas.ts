// Mindset Profile persona data for the scroll-driven <MindsetRing /> component.
//
// Each persona describes a cognitive-performance "split" across the three
// NESTRE dimensions — Cerebral, Alpha, Prime — that always sums to 100.
// NEUTRAL is the baseline the ring rests at before the reader scrolls; the
// three high-performer personas are the states the ring tweens to as the
// section scrolls past. Copy is NESTRE brand voice: aspirational, precise,
// built for people who train the mind like an athlete trains the body.

export type MindsetKey = 'neutral' | 'executive' | 'athlete' | 'thinker'

export type MindsetValues = {
  /** Analytical, strategic, pattern-seeking cognition. */
  cerebral: number
  /** Drive, presence, command — the will to lead and push. */
  alpha: number
  /** Focus, flow, execution under pressure — peak output. */
  prime: number
}

export type Persona = {
  key: MindsetKey
  /** Short label shown in UI — the persona "type" chip (e.g. Baseline, Executive). */
  label: string
  /** The ring split. cerebral + alpha + prime === 100. */
  values: MindsetValues
  /** Person's name shown on the persona card. */
  name: string
  /** Person's role/discipline shown under the name. */
  role: string
  /** Captivating one-line headline (kept for aria / alt uses). */
  headline: string
  /** Single supporting line under the headline. */
  sub: string
  /** First-person one-liner shown on the persona card (italic quote). */
  quote: string
  /** Ambient glow accent for this persona. */
  accent: string
  /** Persona portrait. */
  image: string
  /** Alt text for the portrait. */
  imageAlt: string
}

// Dimension display metadata — neon colors match the ring arcs (source V2).
export const DIMENSIONS = [
  { key: 'cerebral' as const, label: 'Cerebral', color: '#e930ff' },
  { key: 'alpha' as const, label: 'Alpha', color: '#25e979' },
  { key: 'prime' as const, label: 'Prime', color: '#18c8ff' },
]

export const NEUTRAL: Persona = {
  key: 'neutral',
  label: 'Baseline',
  values: { cerebral: 33, alpha: 34, prime: 33 },
  name: 'Sofia Gonzalez',
  role: 'Professional Tennis',
  headline: 'Every mind has a shape.',
  sub: 'Before you train it, you measure it. This is where everyone starts.',
  quote: 'I read balanced across the board — a little of everything, no single spike.',
  accent: '#8fb4ff',
  image: '/mindset/personas/persona-baseline.jpg',
  imageAlt: 'Sofia Gonzalez, professional tennis player',
}

export const PERSONAS: Persona[] = [
  {
    key: 'executive',
    label: 'Executive',
    values: { cerebral: 48, alpha: 32, prime: 20 },
    name: 'Mei Zhao',
    role: 'Chief Strategy Officer',
    headline: 'The mind that runs the room.',
    sub: 'Strategy first, ego last — reads the whole board before anyone else has moved.',
    quote: 'My mind lives in analysis and planning — Cerebral runs the show.',
    accent: '#e930ff',
    image: '/mindset/personas/persona-executive.jpg',
    imageAlt: 'Mei Zhao, chief strategy officer',
  },
  {
    key: 'athlete',
    label: 'Athlete',
    values: { cerebral: 20, alpha: 32, prime: 48 },
    name: 'Marcus Bennett',
    role: 'Competitive Swimmer',
    headline: 'Built to perform on command.',
    sub: 'Pressure is the trigger, not the threat — the body answers before doubt can speak.',
    quote: "It's instinct and drive for me — Prime leads, and thinking follows.",
    accent: '#18c8ff',
    image: '/mindset/personas/persona-athlete.jpg',
    imageAlt: 'Marcus Bennett, competitive swimmer',
  },
  {
    key: 'thinker',
    label: 'Deep-Thinker',
    values: { cerebral: 52, alpha: 20, prime: 28 },
    name: 'Arjun Rao',
    role: 'Endurance Cyclist',
    headline: 'Depth over noise.',
    sub: 'Goes where the hard problems live and stays until the pattern gives way.',
    quote: 'Long roads, long thoughts. I go deep and quiet — heavy on Cerebral.',
    accent: '#c774ff',
    image: '/mindset/personas/persona-deepthinker.jpg',
    imageAlt: 'Arjun Rao, endurance cyclist',
  },
]

// The full scroll sequence: baseline first, then each high performer.
export const SEQUENCE: Persona[] = [NEUTRAL, ...PERSONAS]

// Order the ring draws arcs in (matches DIMENSIONS / label positions).
export const ARC_ORDER: (keyof MindsetValues)[] = ['cerebral', 'alpha', 'prime']
