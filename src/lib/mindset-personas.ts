// Mindset Profile persona data for the scroll-driven <MindsetRing /> component.
//
// Each persona describes a cognitive-performance "split" across the three
// NESTRE dimensions — Cerebral, Alpha, Prime — that always sums to 100. As the
// section scrolls, the ring tweens between each persona's split and the persona
// card cross-fades. Content comes from the approved Figma spec (NestreWeb,
// node 88-1661): real NESTRE athletes, a surgeon, and a collegiate athlete.
//
// NOTE: the `values` (ring percentages) below are PLACEHOLDERS pending David's
// real Mindset Profile numbers for each person — swap them in when provided.

export type MindsetKey = string

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
  /** Short descriptor (kept for aria labelling; the type chip is no longer shown). */
  label: string
  /** The ring split. cerebral + alpha + prime === 100. */
  values: MindsetValues
  /** Person's name shown on the persona card. */
  name: string
  /** Person's role/credentials under the name — may contain `\n` line breaks. */
  role: string
  /** First-person quote shown on the persona card (italic). */
  quote: string
  /** Ambient glow accent for this persona. */
  accent: string
  /** Persona portrait. */
  image: string
  /** CSS object-position for the portrait (tuned per photo crop). */
  imagePos?: string
  /** Alt text for the portrait. */
  imageAlt: string
}

// Dimension display metadata — neon colors match the ring arcs (source V2).
export const DIMENSIONS = [
  { key: 'cerebral' as const, label: 'Cerebral', color: '#e930ff' },
  { key: 'alpha' as const, label: 'Alpha', color: '#25e979' },
  { key: 'prime' as const, label: 'Prime', color: '#18c8ff' },
]

const P = '/app-v2/personas'

export const SEQUENCE: Persona[] = [
  {
    key: 'calvin',
    label: 'Hall of Famer',
    values: { cerebral: 30, alpha: 40, prime: 30 }, // placeholder
    name: 'Calvin Johnson Jr.',
    role: '1st Ballot Pro Football Hall of Fame\nNFL Record Holder',
    quote: '“NESTRE Neuro-Strength training is the future of health, wellness, and performance.”',
    accent: '#25e979',
    image: `${P}/calvin.jpg`,
    imagePos: '31% 28%',
    imageAlt: 'Calvin Johnson Jr., Pro Football Hall of Fame wide receiver',
  },
  {
    key: 'vonda',
    label: 'Orthopedic Surgeon',
    values: { cerebral: 45, alpha: 25, prime: 30 }, // placeholder
    name: 'Vonda Wright, MD',
    role: 'Orthopedic Surgeon\nPresident of Hughston Orthopedics Southeast\nInaugural Medical Director of the University of Pittsburgh (UPMC) Lemieux Sports Center',
    quote: '“Keeping my brain at its highest capacity is a priority and NESTRE works my physical brain to peak performance.”',
    accent: '#e930ff',
    image: `${P}/vonda.jpg`,
    imagePos: '50% 22%',
    imageAlt: 'Vonda Wright, MD, orthopedic surgeon',
  },
  {
    key: 'malcolm',
    label: 'Super Bowl Champion',
    values: { cerebral: 38, alpha: 34, prime: 28 }, // placeholder
    name: 'Malcolm Jenkins',
    role: '2x NFL Super Bowl Champion\nFounder, Broad St Ventures & Malcolm Inc.',
    quote: '“Having invested in and experienced firsthand, high-level innovations in human wellness and sports performance; NESTRE is truly pioneering the future of health, wellness, and performance.”',
    accent: '#18c8ff',
    image: `${P}/malcolm.jpg`,
    imagePos: '50% 42%',
    imageAlt: 'Malcolm Jenkins, 2x NFL Super Bowl champion',
  },
  {
    key: 'michael',
    label: 'Olympic Gold Medalist',
    values: { cerebral: 22, alpha: 30, prime: 48 }, // placeholder
    name: 'Michael Cherry',
    role: 'Olympic Gold Medalist\nUSA Track & Field\nWorld Top Five 400 Runner',
    quote: '“NESTRE has really made me a better athlete, allowing me get the most out of my abilities both mentally and physically!”',
    accent: '#18c8ff',
    image: `${P}/michael.jpg`,
    imagePos: '50% 26%',
    imageAlt: 'Michael Cherry, Olympic gold medalist, USA Track & Field',
  },
  {
    key: 'emil',
    label: 'Collegiate Athlete',
    values: { cerebral: 34, alpha: 30, prime: 36 }, // placeholder
    name: 'Emil Ekiyor Jr.',
    role: 'University of Alabama',
    quote:
      '“Like most college athletes I have invested a lot of time, energy, and resources to train and develop my body so I can perform at the highest level in collegiate sports. I never thought about training my brain, nor did I even think it was even possible to train your brain to not only perform at a high level, but to help you through the grind of a football season.\n\nThen I met Dr. Tommy Shavers and NESTRE. NESTRE has allowed me to lock in on my preparation and performance in practice, training and game day. The ability to control how you stay locked through the ups and downs and grind of a season is powerful.”',
    accent: '#c774ff',
    image: `${P}/emil.jpg`,
    imagePos: '50% 42%',
    imageAlt: 'Emil Ekiyor Jr., University of Alabama football player',
  },
]

// Order the ring draws arcs in (matches DIMENSIONS / label positions).
export const ARC_ORDER: (keyof MindsetValues)[] = ['cerebral', 'alpha', 'prime']
