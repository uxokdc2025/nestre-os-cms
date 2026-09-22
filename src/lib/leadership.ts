import type { MindsetValues } from '@/lib/mindset-personas'

// Leadership team for the Our Story scrollytelling. View derives from
// activeMemberIndex; scroll progress controls the active member.
// NOTE: mindset profiles are placeholders pending final per-person numbers.

export type Leader = {
  id: string
  name: string
  title: string
  image?: string // real headshot; omit → branded initials avatar
  bio: string
  profile: MindsetValues
}

const P = '/app-v2/leaders'

export const LEADERS: Leader[] = [
  {
    id: 'tommy',
    name: 'Dr. Tommy Shavers, D.M.',
    title: 'Founder & CEO',
    image: `${P}/tommy.jpg`,
    bio: '15+ years organizational leadership and high-profile behavior & performance experience. Sports and human performance expert. Former NCAA D1 Captain (UCF). Published researcher.',
    profile: { cerebral: 0, alpha: 80, prime: 20 },
  },
  {
    id: 'goldberg',
    name: 'Dr. Elkhonon Goldberg',
    title: 'Chief Scientific Officer',
    image: `${P}/goldberg.jpg`,
    bio: 'Internationally recognized clinical neuropsychologist. Former NYU Clinical Professor of Neurology. Founding Director, Luria Neuroscience Institute. Neuroplasticity pioneer.',
    profile: { cerebral: 24, alpha: 56, prime: 20 },
  },
  {
    id: 'tomica',
    name: 'Tomica Nelson-Shavers, MBA',
    title: 'President',
    image: `${P}/tomica.jpg`,
    bio: 'President of NESTRE Health & Performance, Inc. MBA with over a decade of experience in business administration, consulting, and executive leadership.',
    profile: { cerebral: 72, alpha: 20, prime: 8 },
  },
  {
    id: 'perez',
    name: 'Carlos Perez',
    title: 'Chief Operating Officer',
    image: `${P}/perez.jpg`,
    bio: '30+ years leadership. U.S. Army Special Forces veteran. Expert in interagency, DoD, and cross-functional teams. Responsible for 620-neurolab deployment execution.',
    profile: { cerebral: 16, alpha: 80, prime: 4 },
  },
  {
    id: 'dorosz',
    name: 'Daniel Dorosz',
    title: 'Chief Technology Officer',
    image: `${P}/dorosz.jpg`,
    bio: '18 years enterprise software. Data science, AI/ML, and deep neural networks across finance, telecom, and healthcare.',
    profile: { cerebral: 28, alpha: 60, prime: 12 },
  },
  {
    id: 'clayton',
    name: 'Clayton Buckaloo',
    title: 'Chief Growth Officer',
    image: `${P}/clayton.jpg`,
    bio: 'Leads commercialization, brand, go-to-market strategy, and market expansion. Brings experience across health, fitness, performance, and consumer growth to turn NESTRE’s science and technology into a scalable category, customer experience, and revenue engine.',
    profile: { cerebral: 24, alpha: 56, prime: 20 },
  },
]

export const initialsOf = (name: string) =>
  name
    .replace(/,.*$/, '')
    .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, '')
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
