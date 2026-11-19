// Copy and data for the ad landing pages (see ad-landing.ts). Lifted verbatim
// from the approved prototypes so both A/B variants read identically — the CTA is
// the only difference between them, and nothing here varies by location.

export const HERO = {
  headline: ['You put work into your health.', 'Give your mind and brain a plan, too.'],
  lead: 'Your focus, your memory, your ability to handle pressure, your capacity for a full day - they matter to the life you want to lead.',
  panels: [
    'Your NESTRE Initial Consultation is our most comprehensive session, bringing together cognitive performance data, your NESTRE Mindset Profile, and one-on-one guidance. Together with your NeuroTrainer, you’ll explore your starting point, connect your findings to your goals, and develop a personalized training plan.',
    'See your data on screen. Ask questions. Understand what it means for you. Your NeuroTrainer will guide you through your results and recommendations, so you leave with a clearer understanding of yourself and a plan for what to train next.',
  ],
  photo: '/ads/hero-woman-right.png',
  photoAlt: 'A woman with her eyes closed in a sunlit, plant-filled room',
}

// The press strip sits on the navy band, so the ad pages use their own strip
// (logos-navy.svg), same layout and sizes as the home / get-started art
// (logos-color.png) but readable on navy: white B/R letters, the official HMS
// knockout (white wordmark, crimson shield), a white Bloomberg wordmark and the
// white VA lockup (Chloe, Nov 18). Sports Illustrated and ESPN are unchanged.
// Sources for each mark: public/legacy/logos/navy/ and the comments in the SVG.
export const LOGO_STRIP = '/legacy/logos/logos-navy.svg'
export const LOGO_STRIP_ALT =
  'Featured by Bleacher Report, Harvard Medical School, Bloomberg, Sports Illustrated, the U.S. Department of Veterans Affairs, and ESPN'

// "NESTRE is for" — the four client stories, each one a short film (Chloe's
// Nov 2026 drop). H.264 MP4 + a poster still from the same clip, so the card
// shows a frame before the film loads and iOS/Chrome can both play it inline
// (see AdLandingBody: muted + playsinline + loop, autoplayed in view).
//
// Persona ↔ film mapping is not a guess: the stand-in posters this section
// shipped with (overthinker/mom/coach/athlete.jpg, now replaced) were stills cut
// from these very clips, so each pairing is the one the prototype already used —
// Chloe = the Overthinker, Kelly = the Mom, Steve = the Coach, Alonza = the
// Athlete. Delivered filenames are kept so an asset traces back to the drop,
// with one change: "Alonza 1_Website_Video" loses its space, because a space in
// a static asset path has to survive URL-encoding through the CDN and there's
// nothing to gain from betting on it.
const V = '/ads/personas'
export type Persona = { label: string; poster: string; alt: string; video?: string }
export const PERSONAS: Persona[] = [
  {
    label: 'The Overthinker',
    video: `${V}/1_Chloe_Ad_Nov_2026.mp4`,
    poster: `${V}/1_Chloe_Ad_Nov_2026.jpg`,
    alt: 'Chloe, a NESTRE client, talking about overthinking',
  },
  {
    label: 'The Mom',
    video: `${V}/Kelly_Ad_Nov_2026.mp4`,
    poster: `${V}/Kelly_Ad_Nov_2026.jpg`,
    alt: 'Kelly, a NESTRE client, talking about showing up for her family',
  },
  {
    label: 'The Coach',
    video: `${V}/2_Steve_Ad_Nov_26.mp4`,
    poster: `${V}/2_Steve_Ad_Nov_26.jpg`,
    alt: 'Steve, a NESTRE client, talking about coaching',
  },
  {
    label: 'The Athlete',
    video: `${V}/Alonza_1_Website_Video.mp4`,
    poster: `${V}/Alonza_1_Website_Video.jpg`,
    alt: 'Alonza, a NESTRE client, talking about athletic performance',
  },
]

// The offer, in one place. Ad pages only — the main site's pricing is untouched.
// `was` is always rendered struck through next to `now` (see AdLandingBody).
export const PRICE = { now: '$250', was: '$300' }

export const CONSULTATION = {
  headline: ['The NESTRE Initial Consultation.', 'A clearer starting point.'],
  intro:
    'See your cognitive performance data on screen. Explore your NESTRE Mindset Profile. Review both with your NeuroTrainer and connect your findings to what you want to work toward.',
  includesLabel: 'Your NESTRE Initial Consultation includes:',
  includes: [
    'A conversation about your goals and daily demands.',
    'A three-minute cognitive performance data recording.',
    'Your NESTRE Mindset Profile.',
    'A guided review of your results.',
    'A personalized report with recommendations for what to train next.',
  ],
  facts: [
    { value: '60 minutes', label: 'Full appointment' },
    { value: PRICE.now, was: PRICE.was, label: 'Limited-time offer' },
  ] as { value: string; label: string; was?: string }[],
  footnote: 'The three-minute recording is one part of your 60-minute consultation.',
}

// Illustrative sample report. The metric rows reuse the site's own scorecard
// markup, so the bars grow and the numbers count up as it scrolls into view.
export const SAMPLE_REPORT = {
  badge: 'ILLUSTRATIVE SAMPLE',
  title: 'Your Data. A Conversation.',
  caption: 'An example of how cognitive performance findings can be presented.',
  metrics: [
    { label: 'Memory', score: 78 },
    { label: 'Attention', score: 92 },
    { label: 'Spatial awareness', score: 63 },
    { label: 'Skilled motor movement', score: 85 },
  ],
  // The prototype crops a rendered Mindset Profile image; we draw the real ring
  // with <MindsetRingCard/> at the same illustrative split.
  mindset: { cerebral: 56, alpha: 11, prime: 33 },
  // Sits at the bottom of the illustrative example, under the ring (Chloe, Nov 18).
  mindsetLabel: 'Your NESTRE Mindset Profile Score',
  disclaimer:
    'Illustrative layout and sample values only. This is not an actual client report or the confirmed report format.',
}

export const GOALS = {
  headline: ['Unlock more of you.', 'What would you like to train for?'],
  choices: [
    'Staying focused through demanding work.',
    'Being present after a full day.',
    'Responding to high pressure.',
    'Continuing to challenge yourself as you get older.',
    'Expanding my capacity.',
    'Sleeping better.',
    'Show up better for my family or loved ones.',
    'Not sure, I want to learn more about my mind',
  ],
  closing: 'Start with what matters in your life. Build your plan from there.',
}

export const EXPERIENCE = {
  eyebrow: 'What to expect · The NESTRE experience',
  headline: 'From NEURO to Strength.',
  sub: 'NESTRE makes cognitive performance understandable — measuring what matters and training for what comes next.',
  steps: [
    {
      step: 'Step 1 · Understanding',
      title: 'NEURO',
      body: 'Understand how your mind and brain process the world around you.',
      image: '/legacy/getstarted/landing-page-neuro-background.png',
      alt: 'A NESTRE client during a cognitive performance data scan',
    },
    {
      step: 'Step 2 · Training',
      title: 'STRENGTH',
      body: 'Train for what matters to you.',
      image: '/legacy/getstarted/landing-page-strength-background-01.png',
      alt: 'A NESTRE training session',
    },
  ],
}

export type SessionItem = { title: string; minutes: string; tagline: string; body: string; featured?: boolean }

export const SESSIONS: {
  eyebrow: string
  headline: string[]
  intro: string
  banner: string
  bannerAlt: string
  items: SessionItem[]
} = {
  eyebrow: 'Your NESTRE sessions',
  headline: ['Start with understanding.', 'Build from there.'],
  intro: 'Explore each session to see where it fits in your journey.',
  banner: '/legacy/getstarted/landing-page-strength-background-04.webp',
  bannerAlt: 'A NESTRE client in a training session',
  items: [
    {
      title: 'NESTRE Consultation',
      minutes: '60 minutes',
      tagline: 'Start here.',
      body: 'Your journey begins with cognitive performance data capture (3-minutes), your NESTRE Mindset Profile, and an in-depth conversation with your NeuroTrainer. This is the session where you’ll spend the most time together, asking questions, exploring your results, and building a plan for the mind and brain you bring to your everyday life.',
      featured: true,
    },
    {
      title: 'NESTRE Signature Training',
      minutes: '45 minutes',
      tagline: 'Training built around your data.',
      body: 'A highly customized session shaped by your unique cognitive performance data and personal training goals.',
    },
    {
      title: 'NESTRE Everyday Performer Training',
      minutes: '30 minutes',
      tagline: 'Train for what matters to you.',
      body: 'A preset training session designed around a specific cognitive performance goal, such as memory or focus.',
    },
    {
      title: 'NESTRE Executive Training',
      minutes: '45 minutes',
      tagline: 'A personalized approach to ongoing training.',
      body: 'A blend of Signature and Everyday Performer Training, combining sessions built around your data with sessions focused on specific goals. Available with an active training package of at least four sessions per month.',
    },
  ],
}

export type Story = {
  photo: string
  alt: string
  quote: string
  name: string
  credits: string[]
  links?: { label: string; href: string; ariaLabel?: string }[]
}

const S = '/ads/photos'

export const STORIES: Story[] = [
  {
    photo: `${S}/ayden-febres-optimized.webp`,
    alt: 'Ayden Febres playing golf',
    quote: '“I was looking for an edge over my competition and NESTRE helped me improve how long I could focus on the golf course. The training sessions were amazing and mind blowing.”',
    name: 'Ayden Febres',
    credits: ['2025 FJT Tour Championship winner · Boys 13–15', '2026 U.S. Junior Amateur competitor'],
    links: [
      { label: 'Read the story', href: 'https://golfusion.com/cognitive-performance/' },
      { label: 'Golf accomplishments', href: 'https://www.fsga.org/Membership/Profile/791d3b34-0bfa-4f75-8d3e-2872517df06b', ariaLabel: 'Ayden Febres golf accomplishments' },
    ],
  },
  {
    photo: `${S}/calvin-johnson-optimized.webp`,
    alt: 'Calvin Johnson in his Detroit Lions uniform',
    quote: '“NESTRE Neuro-Strength Training is the future of health, wellness, and performance for elite performers as well as the everyday individual looking to get better.”',
    name: 'Calvin Johnson',
    credits: ['Detroit Lions legend', 'NFL Hall of Famer'],
    links: [{ label: 'Read the story', href: 'https://nestreperformance.com/destination-packages/' }],
  },
  {
    photo: `${S}/vonda-wright-optimized.webp`,
    alt: 'Dr. Vonda Wright in a white coat against a red backdrop',
    quote: '“I thought most brains had the same capacity. I was so wrong … [NESTRE] helped me extend grace realizing that all brains are so individual and so different.”',
    name: 'Dr. Vonda Wright',
    credits: [
      'Double-board-certified orthopedic surgeon',
      'New York Times bestselling author of Unbreakable',
      'Founding director of PRIMA, the Performance and Research Initiative for Masters Athletes',
    ],
    links: [
      { label: 'Listen to the conversation', href: 'https://thebettermind.buzzsprout.com/2514540/episodes/17694493-the-unbreakable-mindset?t=0' },
      { label: 'About Dr. Wright', href: 'https://www.penguinrandomhouse.com/books/777365/unbreakable-by-vonda-wright-md/' },
    ],
  },
  {
    photo: `${S}/rg3-optimized.webp`,
    alt: 'Robert Griffin III',
    quote: '“NESTRE brain training is not just a product, it’s a lifestyle. To be able to sharpen your skills cognitively in a way that hasn’t really been done before is groundbreaking.”',
    name: 'Robert Griffin III',
    credits: ['Heisman Trophy winner · NFL Rookie of the Year'],
  },
  {
    photo: `${S}/malcolm-jenkins-optimized.webp`,
    alt: 'Malcolm Jenkins',
    quote: '“Having invested in and experienced firsthand, high-level innovations in human wellness and sports performance; NESTRE is truly pioneering the future of health, wellness, and performance.”',
    name: 'Malcolm Jenkins',
    credits: ['Two-time Super Bowl champion · Founder, Broad St Ventures & Malcolm Inc.'],
  },
  {
    photo: `${S}/kyle-williams-optimized.webp`,
    alt: 'Kyle Williams',
    quote: '“NESTRE literally saved my life. There are so many players out there suffering and trying to navigate life as a lesser version of themselves with no real solutions. NESTRE is a real solution to help people get better; I’m living proof.”',
    name: 'Kyle Williams',
    credits: ['Super Bowl 50 champion · Six-year NFL veteran'],
  },
  {
    photo: `${S}/leigh-steinberg-optimized.webp`,
    alt: 'Leigh Steinberg',
    quote: '“I found NESTRE to be a cutting-edge breakthrough in advancing brain neuroplasticity led by a brilliant pioneer in the field, Dr. Tommy Shavers.”',
    name: 'Leigh Steinberg',
    credits: ['NFL sports agent · Brain health advocate'],
  },
  {
    photo: `${S}/ken-williams-optimized.webp`,
    alt: 'Ken Williams',
    quote: '“NESTRE can be a game changer for MLB Players and Organizations.”',
    name: 'Ken Williams',
    credits: ['Chicago White Sox executive'],
  },
  {
    photo: `${S}/kyle-fraser-optimized.webp`,
    alt: 'Kyle Fraser',
    quote: '“I have been in athletics my entire life and have never been involved in something that has had as much of a positive impact on my athletic performance as NESTRE.”',
    name: 'Kyle Fraser',
    credits: ['Professional golfer · Former Stanford lacrosse athlete'],
  },
  {
    photo: `${S}/emil-ekiyor-optimized.webp`,
    alt: 'Emil Ekiyor Jr.',
    quote: '“Like most college athletes I have invested a lot of time, energy, and resources to train and develop my body so I can perform at the highest level in collegiate sports. I never thought about training my brain, nor did I even think it was even possible to train your brain to not only perform at a high level, but to help you through the grind of a football season. Then I met Dr. Tommy Shavers and NESTRE. NESTRE has allowed me to lock in on my preparation and performance in practice, training and game day. The ability to control how you stay locked through the ups and downs and grind of a season is powerful.”',
    name: 'Emil Ekiyor Jr.',
    credits: ['University of Alabama football'],
  },
  {
    photo: `${S}/michael-cherry-optimized.webp`,
    alt: 'Michael Cherry',
    quote: '“NESTRE has really made me a better athlete, allowing me get the most out of my abilities both mentally and physically!”',
    name: 'Michael Cherry',
    credits: ['Olympic gold medalist · USA Track & Field'],
  },
  {
    photo: `${S}/chloe-abbott-optimized.webp`,
    alt: 'Chloe Abbott',
    quote: '“NESTRE brain training is a real workout. Through a few days of my strength training sessions, I was able to unlock new paths of thought, which made my decision making clearer and more decisive. With NESTRE’s brain training, I am able to get insight on what’s going on inside my mind in real-time.”',
    name: 'Chloe Abbott',
    credits: ['Pro track athlete · Singer · University of Kentucky All-American'],
  },
  {
    photo: `${S}/bennie-fowler-optimized.webp`,
    alt: 'Bennie Fowler',
    quote: '“I cannot thank NESTRE enough for everything they’ve done for me as a person and a player. It’s helped me put things into perspective, understand the importance of the brain, and also get control of my life. Going through this program is one of the best things I’ve ever done in my life.”',
    name: 'Bennie Fowler',
    credits: ['Former NFL player · Published author & speaker'],
  },
  {
    photo: `${S}/jonah-edwards-optimized.webp`,
    alt: 'Jonah Edwards',
    quote: '“NESTRE mind and brain training were integral in our complete turnaround season. They are an incredible asset for Magic Gaming.”',
    name: 'Jonah Edwards',
    credits: ['GM / Head Coach, Magic Gaming'],
  },
  {
    photo: `${S}/spencer-paysinger-optimized.webp`,
    alt: 'Spencer Paysinger',
    quote: '“I had the pleasure of going through the NESTRE Training the week our nations lockdown went into effect. In hindsight it was the best thing I could have done to get my mind ready for our new normal. In as early as my second day of training I felt my mind at ease with usual daily worries and by my last session of the week my shoulders felt as if a weight had been removed entirely. I believe any person or business seeking optimal performance could benefit from implementing NESTRE Training.”',
    name: 'Spencer Paysinger',
    credits: ['Super Bowl XLVI champion · Producer, All American'],
  },
  {
    photo: `${S}/tia-mcneill-optimized.webp`,
    alt: 'Tia McNeill',
    quote: '“NESTRE can help change the narrative in such a powerful way by letting people know that it is possible to improve their quality of life when it’s been said that it cannot be done. NESTRE has helped me personally get better, and I now look forward to helping NESTRE help as many people as possible get better as well.”',
    name: 'Tia McNeill',
    credits: ['Former NFL players caregiver advocate'],
  },
]

export const STORIES_NOTE = 'Swipe, scroll, or use the arrows to explore. Individual experiences vary.'

// Closing band + the line under the hero CTA. Discovery explains the quiz step;
// consultation states the price and goes straight to the calendar. Any `$300`
// in this copy renders struck through (AdLandingBody's `strikeWas`), so the
// offer always reads as $250 against the regular price.
export const CTA_SUPPORT = {
  discovery: ['Answer a few questions, then choose a time for a complimentary discovery call about your goals and the NESTRE Initial Consultation.'],
  consultation: [`${PRICE.now} ${PRICE.was} · Limited-time offer`, 'Choose a time for your initial NESTRE consultation.'],
}

export const CONSULT_CARD_NOTE = `Pay ${PRICE.now} for your initial consultation, regularly ${PRICE.was}. Limited-time offer.`
