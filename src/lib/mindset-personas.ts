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
  /** Short label shown in UI (e.g. step markers, aria text). */
  label: string
  /** The ring split. cerebral + alpha + prime === 100. */
  values: MindsetValues
  /** Captivating one-line headline shown beside the ring. */
  headline: string
  /** Single supporting line under the headline. */
  sub: string
  /** Minimal captivating one-liner shown near the floating image. */
  quote: string
  /** Lifestyle image (existing media library URL used as a placeholder). */
  image: string
  /** Alt text for the lifestyle image. */
  imageAlt: string
}

// Dimension display metadata — colors match the ring arcs.
export const DIMENSIONS = [
  { key: 'cerebral' as const, label: 'Cerebral', color: '#e0459a' },
  { key: 'alpha' as const, label: 'Alpha', color: '#35c46a' },
  { key: 'prime' as const, label: 'Prime', color: '#24b6d6' },
]

export const NEUTRAL: Persona = {
  key: 'neutral',
  label: 'Baseline',
  values: { cerebral: 33, alpha: 34, prime: 33 },
  headline: 'Every mind has a shape.',
  sub: 'Before you train it, you measure it. This is where everyone starts.',
  quote: 'This is your baseline.',
  image: '/api/media/file/forest-breath.jpg',
  imageAlt: 'A calm figure breathing in a quiet forest at first light',
}

export const PERSONAS: Persona[] = [
  {
    key: 'executive',
    label: 'Executive',
    values: { cerebral: 48, alpha: 32, prime: 20 },
    headline: 'The mind that runs the room.',
    sub: 'Strategy first, ego last — reads the whole board before anyone else has moved.',
    quote: 'Composed under fire.',
    image: '/api/media/file/forest-breath.jpg',
    imageAlt: 'A composed leader in a moment of focused stillness',
  },
  {
    key: 'athlete',
    label: 'Athlete',
    values: { cerebral: 20, alpha: 32, prime: 48 },
    headline: 'Built to perform on command.',
    sub: 'Pressure is the trigger, not the threat — the body answers before doubt can speak.',
    quote: 'Peak, on demand.',
    image: '/api/media/file/ab3-athlete.jpg',
    imageAlt: 'An athlete mid-effort at peak intensity',
  },
  {
    key: 'thinker',
    label: 'Deep-Thinker',
    values: { cerebral: 52, alpha: 20, prime: 28 },
    headline: 'Depth over noise.',
    sub: 'Goes where the hard problems live and stays until the pattern gives way.',
    quote: 'Optimized with NESTRE.',
    image: '/api/media/file/runner-sunrise.jpg',
    imageAlt: 'A solitary runner facing the open horizon at sunrise',
  },
]

// The full scroll sequence: baseline first, then each high performer.
export const SEQUENCE: Persona[] = [NEUTRAL, ...PERSONAS]

// Order the ring draws arcs in (matches DIMENSIONS / label positions).
export const ARC_ORDER: (keyof MindsetValues)[] = ['cerebral', 'alpha', 'prime']
