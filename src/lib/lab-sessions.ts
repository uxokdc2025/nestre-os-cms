// Verbatim session-type copy from Chloe DeLuca's 26.11.23 NeuroLabs Session Types brief.
// The first sentence of each body is the short lead line.

export type LabSession = {
  title: string
  duration: string
  lead: string
  body: string
  isNew?: boolean
  note?: string
}

export const LAB_SESSIONS_HEADING =
  'Start with a consultation. Then train for what matters to you.'

export const LAB_SESSIONS: LabSession[] = [
  {
    title: 'NESTRE Consultation',
    duration: '60 min',
    lead: 'Start here.',
    body: 'Your first visit includes a three-minute cognitive performance data scan, your NESTRE Mindset Profile, and an in-depth conversation with your NeuroTrainer. You’ll review your results, ask questions, and leave with a training plan shaped around your goals.',
  },
  {
    title: 'NESTRE Signature Training',
    duration: '45 min',
    lead: 'Training built around your data.',
    body: 'A highly customized session shaped by your cognitive performance data and personal training goals.',
  },
  {
    title: 'NESTRE Everyday Performer Training',
    duration: '30 min',
    lead: 'Train for a specific goal.',
    body: 'A preset session focused on one area of cognitive performance, such as memory or focus.',
  },
  {
    title: 'NESTRE Executive Training',
    duration: '30 min',
    lead: 'Personalized training, month to month.',
    body: 'Combines Signature sessions built around your data with Everyday Performer sessions focused on specific goals.',
    isNew: true,
    note: 'Available with an active training package of at least four sessions per month.',
  },
]
