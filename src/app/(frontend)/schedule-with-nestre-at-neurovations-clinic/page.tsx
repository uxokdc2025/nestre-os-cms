import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { SchedulePageBody, type ScheduleConfig } from '@/components/SchedulePageBody'

export const metadata: Metadata = {
  title: 'Schedule with NESTRE at Neurovations Clinic | NESTRE Performance',
  description: 'Book your NESTRE consultation and Neuro-Strength training at the Neurovations Clinic.',
  alternates: { canonical: `${SITE_URL}/schedule-with-nestre-at-neurovations-clinic` },
}

const cfg: ScheduleConfig = {
  location: 'Neurovations Clinic',
  consultationId: '2112998',
  jumpstartId: '2108867',
  hours: '10:00am – 5:00pm (EST)',
  consultPrice: '$300',
  videos: { whatToExpect: '/api/media/file/sched-what-to-expect.mp4', signup: '/api/media/file/sched-signup.mp4' },
  programs: [
    { name: 'Intensive Strength Training Program', sub: '2 sessions per day for 5 days', id: '2108866', tier: 'Advanced' },
    { name: 'Launch Training Program', sub: '2 sessions per day for 3 days', id: '2108869', tier: 'Advanced' },
    { name: 'Jump Start Training Program', sub: '1 session per day for 5 days', id: '2108867', tier: 'Base' },
    { name: 'Spark Training Program', sub: '1 session per day for 3 days', id: '2108870', tier: 'Base' },
  ],
  packages: [
    { name: 'Better with Age', id: '2112559' }, { name: 'Copy That!', id: '2112560' },
    { name: 'Head in the Game', id: '2112561' }, { name: 'PIT Stop', id: '2112562' },
    { name: 'Re-Charge', id: '2112563' }, { name: 'Think Fast', id: '2112564' },
    { name: 'Decision Maker', id: '2112565' }, { name: 'Laser Focused', id: '2112566' },
    { name: 'Memory Muscle', id: '2112567' }, { name: 'Movement Master', id: '2112571' },
    { name: 'Quiet in the Storm', id: '2112568' },
  ],
}
export default function Page() { return <SchedulePageBody cfg={cfg} /> }
