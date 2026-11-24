// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY LANDING PAGE — the one file to edit for the next holiday.
//
// Route: /holiday (src/app/(frontend)/holiday/page.tsx). Not in the main nav.
// Design: Chloe DeLuca's reference (Nov 24, 2026),
//   https://nestre-holiday-page-chloe.gigglyledge2.chatgpt.site
//
// To run a new holiday / promotion:
//   1. Change the text below (eyebrow, headline, intro, offer, disclaimer, …).
//      A "|" in `headline` is a line break.
//   2. To change a photo, drop the new file in /public/holiday/ (or
//      /public/holiday/goals/ for the carousel) and point `src` at it.
//   3. No offer this time? Set `hero.offer` to null and `offer.promo` / the
//      price lines as needed; empty `promoCode` / `terms` lines are hidden.
//   4. Every "Book a consultation" button (header, hero, offer, includes and
//      every carousel card) uses `bookingUrl` — change it in one place.
//   5. Ship it like any other change: staging → team review → production.
// Layout, animations and styles live in holiday.css / HolidayMotion.tsx and
// normally don't need touching.
// ─────────────────────────────────────────────────────────────────────────────

/** The page's URL. The site header/footer are hidden here (the page draws its own). */
export const HOLIDAY_PATH = '/holiday'

export type HolidayImage = {
  src: string
  alt: string
  width: number
  height: number
  /** Optional CSS object-position for the crop, e.g. "60% 35%". */
  objectPosition?: string
}

export type HolidayCampaign = {
  path: string
  meta: { title: string; description: string }
  /** Every "Book a consultation" button links here (opens in a new tab). */
  bookingUrl: string
  ctaLabel: string
  phone: { display: string; tel: string }
  hero: {
    /** Small gold-ruled label above the headline. */
    eyebrow: string
    /** "|" = line break. */
    headline: string
    intro: string
    /** Offer lines under the intro. Set to null when there is no offer. */
    offer: { line: string; highlight: string } | null
    image: HolidayImage
    /** Subtle gold sparkles over the hero photo. */
    sparkles: boolean
  }
  offer: {
    caption: string
    label: string
    duration: string
    durationDetail: string
    /** Struck-through value, e.g. "$675 value". Empty string hides it. */
    valueText: string
    priceText: string
    title: string
    body: string
    invitation: string
    /** Optional: shown as "Use code X at checkout." Empty string hides it. */
    promoCode: string
    /** Optional small offer-dates/terms line. Empty string hides it. */
    terms: string
  }
  includes: { heading: string; items: string[]; bonus: string }
  locations: { heading: string; places: { name: string; lines: string[] }[] }
  dataSample: {
    title: string
    body: string
    metrics: { label: string; score: number; color: string }[]
    profile: { cerebral: number; alpha: number; prime: number; caption: string }
  }
  goals: { heading: string; subheading: string; hint: string; cards: { title: string; image: HolidayImage }[] }
  footer: { tagline: string; areas: string }
  /** Small print at the very bottom of the page. */
  disclaimer: string
}

export const HOLIDAY_CAMPAIGN: HolidayCampaign = {
  path: HOLIDAY_PATH,
  meta: {
    title: 'NESTRE for the Holidays',
    description:
      'Experience NESTRE for yourself. Explore your initial consultation and personalized mind and brain fitness.',
  },
  bookingUrl: 'https://app.acuityscheduling.com/schedule.php?owner=23912005&appointmentType=100859077',
  ctaLabel: 'Book a consultation',
  phone: { display: '689-710-3260', tel: '6897103260' },
  hero: {
    eyebrow: 'The NESTRE Holiday Offer',
    headline: 'More of you|in every season.',
    intro:
      'Invest in your mind and brain for the life you want to live — and the people you want to share it with.',
    offer: { line: 'Buy one consultation.', highlight: 'Your first training session is on us.' },
    image: {
      src: '/holiday/nestre-happy-holidays.jpg',
      alt: 'NESTRE Happy Holidays card with a blue ribbon on a stone table',
      width: 1536,
      height: 1024,
    },
    sparkles: true,
  },
  offer: {
    caption: 'Your NESTRE Holiday Offer',
    label: 'Consultation + first training session',
    duration: '90 minutes',
    durationDetail: '60-minute consultation + 30-minute training',
    valueText: '$675 value',
    priceText: 'You pay $300',
    title: 'Your personalized starting point',
    body: 'Understand more about how your mind works. Explore your cognitive strengths and discover where you can grow.',
    invitation:
      'Your NeuroTrainer connects your cognitive performance data with your goals and everyday experiences. You’ll leave with a personalized report and recommendations for what to train next.',
    promoCode: '',
    terms: '',
  },
  includes: {
    heading: 'Your initial consultation includes:',
    items: [
      '3-minute cognitive performance data scan',
      'NESTRE Mindset Profile',
      '60-minute consultation with a NeuroTrainer',
      'Take-home report with personal insights and training recommendations',
    ],
    bonus: 'Plus, your first 30-minute training session after your consultation is included at no additional cost.',
  },
  locations: {
    heading: 'Located at the',
    places: [
      { name: 'Lake Nona Performance Club', lines: ['6775 Chopra Ter', 'Orlando, FL 32827', 'United States'] },
      { name: 'Neurovations Clinic in Winter Park', lines: ['2200 Lee Rd', 'Winter Park, FL 32789', 'United States'] },
    ],
  },
  dataSample: {
    title: 'Your data. A conversation.',
    body: 'An example of how cognitive performance findings can be presented.',
    metrics: [
      { label: 'Memory', score: 78, color: '#e532ca' },
      { label: 'Attention', score: 92, color: '#6fecfb' },
      { label: 'Spatial awareness', score: 63, color: '#74fb52' },
      { label: 'Capacity', score: 85, color: '#16d77c' },
    ],
    profile: { cerebral: 16, alpha: 40, prime: 44, caption: 'Your NESTRE Mindset Profile score' },
  },
  goals: {
    heading: 'Unlock more of you.',
    subheading: 'What would you like to train for?',
    hint: 'Scroll, swipe, or pause to explore',
    cards: [
      { title: 'Staying focused through demanding work.', image: { src: '/holiday/goals/focus-selected.jpg', alt: 'A woman walking confidently through the city in black and white', width: 2048, height: 1340 } },
      { title: 'Being present after a full day.', image: { src: '/holiday/goals/presence-selected.jpg', alt: 'A mother and baby smiling together', width: 2047, height: 740 } },
      { title: 'Responding to high pressure.', image: { src: '/holiday/goals/pressure-selected.jpg', alt: 'A climber scaling a steep rock face at sunset', width: 1080, height: 1350 } },
      { title: 'Getting better with age.', image: { src: '/holiday/goals/age-man.jpg', alt: 'A man relaxing at home and looking ahead', width: 2048, height: 1080 } },
      { title: 'Training for greater capacity.', image: { src: '/holiday/goals/capacity-selected.jpg', alt: 'A woman with curly hair looking ahead', width: 2048, height: 1152 } },
      { title: 'Sleeping better.', image: { src: '/holiday/goals/sleep.jpg', alt: 'A woman resting on a pillow', width: 850, height: 1100 } },
      { title: 'Show up better for my family and loved ones.', image: { src: '/holiday/goals/family-selected.jpg', alt: 'Two women, one older, embracing', width: 2048, height: 1316 } },
      { title: 'Better Relationship', image: { src: '/holiday/goals/relationship.jpg', alt: 'A couple sharing a quiet moment together', width: 2047, height: 1141, objectPosition: '60% 35%' } },
    ],
  },
  footer: { tagline: 'Life is the performance. Train for it.', areas: 'Lake Nona · Winter Park' },
  disclaimer:
    'Offer ends January 7, 2027. Includes one 60-minute consultation and one 30-minute training session. Prices subject to change. Additional terms and eligibility restrictions may apply.',
}
