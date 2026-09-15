import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { SchedulePageBody, type ScheduleConfig } from '@/components/SchedulePageBody'

export const metadata: Metadata = {
  title: 'Schedule with NESTRE at Lake Nona Performance Club | NESTRE Performance',
  description: 'Book your NESTRE consultation and Neuro-Strength training at Lake Nona Performance Club.',
  alternates: { canonical: `${SITE_URL}/schedule-with-nestre-at-lake-nona-performance-club` },
}

const cfg: ScheduleConfig = {
  location: 'Lake Nona Performance Club',
  consultationId: '2112997',
  jumpstartId: '2108854',
  video: '/api/media/file/sched-what-to-expect.mp4',
  videoHeading: 'What to expect during your consultation.',
  hours: '10:00am – 5:00pm (EST)',
  consultPrice: '$300',
  packages: [
    { name: 'Better with Age', id: '2112539' }, { name: 'Copy That!', id: '2112546' },
    { name: 'Head in the Game', id: '2112549' }, { name: 'PIT Stop', id: '2112550' },
    { name: 'Re-Charge', id: '2112541' }, { name: 'Think Fast', id: '2112551' },
    { name: 'Decision Maker', id: '2112552' }, { name: 'Laser Focused', id: '2112553' },
    { name: 'Memory Muscle', id: '2112554' }, { name: 'Movement Master', id: '2112569' },
    { name: 'Quiet in the Storm', id: '2112556' },
  ],
}
export default function Page() { return <SchedulePageBody cfg={cfg} /> }
