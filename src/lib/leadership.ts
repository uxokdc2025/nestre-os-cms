import type { MindsetValues } from '@/lib/mindset-personas'

// Leadership team for the Our Story scrollytelling. View derives from
// activeMemberIndex; scroll progress controls the active member.
// NOTE: bios + mindset profiles are placeholders pending the final content.

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
    bio: 'Creator of the NESTRE model and a former University of Central Florida team captain. After recovering his own cognitive performance, he built NESTRE to help others train the mind like the body.',
    profile: { cerebral: 0, alpha: 80, prime: 20 },
  },
  {
    id: 'goldberg',
    name: 'Dr. Elkhonon Goldberg',
    title: 'Chief Scientific Officer',
    image: `${P}/goldberg.jpg`,
    bio: 'World-renowned neuropsychologist, Director of the Luria Neuroscience Institute, and a Diplomate of the American Board of Professional Psychology.',
    profile: { cerebral: 50, alpha: 21, prime: 29 },
  },
  {
    id: 'tomica',
    name: 'Tomica Nelson-Shavers, MBA',
    title: 'President',
    bio: 'Leads NESTRE operations and growth, translating the science of neuro-strength into a premium, human experience for every member.',
    profile: { cerebral: 34, alpha: 40, prime: 26 },
  },
  {
    id: 'perez',
    name: 'Carlos Perez',
    title: 'Chief Operating Officer',
    bio: 'Runs day-to-day operations across NESTRE, keeping the training experience consistent, reliable, and scalable.',
    profile: { cerebral: 30, alpha: 40, prime: 30 },
  },
  {
    id: 'dorosz',
    name: 'Daniel Dorosz',
    title: 'Chief Technology Officer',
    bio: 'A seasoned software engineer and technical lead. Builds the platform that turns cognitive performance data into personalized training.',
    profile: { cerebral: 44, alpha: 26, prime: 30 },
  },
  {
    id: 'buckaloo',
    name: 'Clayton Buckaloo',
    title: 'Chief Growth Officer',
    bio: 'Leads brand and growth, bringing NESTRE’s neuro-strength approach to more people, teams, and performers.',
    profile: { cerebral: 28, alpha: 44, prime: 28 },
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
