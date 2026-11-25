// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAY LANDING PAGE — the one file to edit for the next holiday.
//
// Route: /holiday (src/app/(frontend)/holiday/page.tsx). Not in the main nav.
// Design: Chloe DeLuca's reference (updated Nov 25, 2026),
//   https://nestre-holiday-page-chloe.gigglyledge2.chatgpt.site
//
// To run a new holiday / promotion:
//   1. Change the text below (eyebrow, headline, intro, offer, gift copy,
//      testimonials, disclaimer, …). A "|" in `headline` is a line break.
//   2. To change a photo, drop the new file in /public/holiday/ (or
//      /public/holiday/goals/ for the carousel, /public/holiday/testimonials/
//      for quote portraits) and point `src` at it.
//   3. No offer this time? Set `hero.offer` to null and `offer.promo` / the
//      price lines as needed; empty `promoCode` / `terms` lines are hidden.
//   4. "Book a consultation" buttons use `bookingUrl`. "Purchase as a Gift"
//      buttons use `giftUrl`. Change each in one place. Both open in a new tab.
//   5. The offer end date lives in `offerEndsOn` only — the disclaimer is
//      built from that field. Change the date there, nowhere else.
//   6. Ship it like any other change: staging → team review → production.
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

export type HolidayTestimonial = {
  name: string
  bio: string
  quote: string
  image: HolidayImage
}

export type HolidayCampaign = {
  path: string
  meta: { title: string; description: string }
  /** Every "Book a consultation" button links here (opens in a new tab). */
  bookingUrl: string
  ctaLabel: string
  /** Every "Purchase as a Gift" button links here (opens in a new tab). */
  giftUrl: string
  giftLabel: string
  /** Word between the two checkout buttons, e.g. "OR". */
  orLabel: string
  phone: { display: string; tel: string }
  /**
   * Single editable offer end date. The disclaimer is built from this.
   * Chloe's Nov 25 email says January 1, 2027 (she earlier said January 7).
   */
  offerEndsOn: string
  /** Sentence after the date in the footer disclaimer. */
  disclaimerRest: string
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
  gift: { heading: string; intro: string; description: string }
  dataSample: {
    title: string
    body: string
    metrics: { label: string; score: number; color: string }[]
    profile: { cerebral: number; alpha: number; prime: number; caption: string }
  }
  goals: { heading: string; subheading: string; hint: string; cards: { title: string; image: HolidayImage }[] }
  testimonials: { heading: string; items: HolidayTestimonial[] }
  footer: { tagline: string; areas: string }
}

export function holidayDisclaimer(campaign: Pick<HolidayCampaign, 'offerEndsOn' | 'disclaimerRest'>): string {
  return `Offer ends ${campaign.offerEndsOn}. ${campaign.disclaimerRest}`
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
  giftUrl: 'https://app.acuityscheduling.com/catalog/1f29f701/?productId=2328855&clearCart=true',
  giftLabel: 'Purchase as a Gift',
  orLabel: 'OR',
  phone: { display: '689-710-3260', tel: '6897103260' },
  offerEndsOn: 'January 1, 2027',
  disclaimerRest:
    'Includes one 60-minute consultation and one 30-minute training session. Prices subject to change. Additional terms and eligibility restrictions may apply.',
  hero: {
    eyebrow: 'NESTRE Holiday Offer',
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
    caption: 'Your Holiday Offer',
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
  gift: {
    heading: 'Want to purchase this offer for someone else?',
    intro: 'Send them a digital gift card!',
    description:
      'Give a friend or loved one a 60-minute NESTRE consultation, with their first 30-minute training session on us. Their digital gift card includes instructions for booking.',
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
      { title: 'Building resilience for the demands of everyday life.', image: { src: '/holiday/goals/sleep.jpg', alt: 'A woman resting on a pillow', width: 850, height: 1100 } },
      { title: 'Show up better for my family and loved ones.', image: { src: '/holiday/goals/family-selected.jpg', alt: 'Two women, one older, embracing', width: 2048, height: 1316 } },
      { title: 'Building capacity for human connection.', image: { src: '/holiday/goals/relationship.jpg', alt: 'A couple sharing a quiet moment together', width: 2047, height: 1141, objectPosition: '60% 35%' } },
    ],
  },
  testimonials: {
    heading: 'Clients reported the following',
    items: [
      {
        name: 'Calvin Johnson Jr.',
        bio: 'Detroit Lions legend, NFL Hall of Famer',
        quote: '“NESTRE Neuro-Strength training is the future of health, wellness, and performance.”',
        image: { src: '/holiday/testimonials/calvin.jpg', alt: 'Calvin Johnson Jr.', width: 240, height: 240, objectPosition: '50% 50%' },
      },
      {
        name: 'Kyle Fraser',
        bio: 'Women’s Professional Golfer · Former Stanford Lacrosse Athlete',
        quote: '“I have been in athletics my entire life and have never been involved in something that has had as much of a positive impact on my athletic performance as NESTRE.”',
        image: { src: '/holiday/testimonials/kyle.jpg', alt: 'Kyle Fraser', width: 240, height: 240 },
      },
      {
        name: 'Robert Griffin III',
        bio: 'Heisman Trophy Winner · NFL Rookie of the Year',
        quote: '“NESTRE brain training is not just a product, it’s a lifestyle. To be able to sharpen your skills cognitively in a way that hasn’t really been done before is groundbreaking.”',
        image: { src: '/holiday/testimonials/robert.jpg', alt: 'Robert Griffin III', width: 240, height: 240 },
      },
      {
        name: 'Vonda Wright, MD',
        bio: 'Orthopedic surgeon, author and longevity specialist',
        quote: '“Keeping my brain at its highest capacity is a priority and NESTRE works my physical brain to peak performance.”',
        image: { src: '/holiday/testimonials/vonda.jpg', alt: 'Vonda Wright, MD', width: 240, height: 240 },
      },
      {
        name: 'Ken Williams',
        bio: 'Former EVP, Chicago White Sox',
        quote: '“NESTRE can be a game changer for MLB Players and Organizations.”',
        image: { src: '/holiday/testimonials/ken.jpg', alt: 'Ken Williams', width: 240, height: 240 },
      },
    ],
  },
  footer: { tagline: 'Life is the performance. Train for it.', areas: 'Lake Nona · Winter Park' },
}
