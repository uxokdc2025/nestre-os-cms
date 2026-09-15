import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { SchedulePageBody, type ScheduleConfig } from '@/components/SchedulePageBody'

export const metadata: Metadata = {
  title: 'Schedule with NESTRE in Monterey | NESTRE Performance',
  description: 'Book your NESTRE consultation and Neuro-Strength training in Monterey, CA.',
  alternates: { canonical: `${SITE_URL}/schedule-with-nestre-in-monterey` },
}

const cfg: ScheduleConfig = {
  location: 'Monterey',
  consultationId: '2113000',
  jumpstartId: '2011825',
  video: '/api/media/file/sched-monterey.mp4',
  videoHeading: 'How to schedule a consultation.',
  hours: '7:30am – 3:00pm (PST)',
  zoom: 'https://us06web.zoom.us/j/85207285505?pwd=Sn4N07xrxEb1G2cypiZeJGBCnpYyTb.1',
  consultPrice: '$500',
  packages: [
    { name: 'Better with Age', id: '2108566' }, { name: 'Copy That!', id: '2108569' },
    { name: 'Head in the Game', id: '2108578' }, { name: 'PIT Stop', id: '2108581' },
    { name: 'Re-Charge', id: '2108564' }, { name: 'Think Fast', id: '2108582' },
    { name: 'Decision Maker', id: '2108625' }, { name: 'Laser Focused', id: '2108626' },
    { name: 'Memory Muscle', id: '2108629' }, { name: 'Movement Master', id: '2108630' },
    { name: 'Quiet in the Storm', id: '2108631' },
  ],
}
export default function Page() { return <SchedulePageBody cfg={cfg} /> }
