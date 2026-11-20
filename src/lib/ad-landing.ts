// Ad landing pages — the discovery-call / consultation-booking A/B test.
//
// Two paid-traffic pages built from the approved prototypes (Chloe, Nov 2026):
// the same page, split only by what the CTA does. The DISCOVERY variant opens
// the LeadConnector quiz popup (the one with Chloe's photo and the resized
// headline — see SurveyModal / survey-widget); the CONSULTATION variant opens
// the site's own "Choose your location." menu (ConsultPopover). Everything else
// — copy, sections, order — is identical, so the test measures the CTA and
// nothing else.
//
// Both locations now live on one page per variant (Chloe, Nov 20 2026): the two
// URLs of a pair point at the same config, so each of the four ad URLs still
// answers 200 at its own address and renders the combined page.
//
// SiteHeader reads this map to render the stripped header (logo + the page's own
// CTA, no nav), and the layout hides the marketing footer on these paths — the
// prototypes carry only a one-line footer, which AdLandingBody renders itself.
import type { Metadata } from 'next'
import type { ConsultLocation } from './book-training'
import { CONSULT_SURVEY_ID } from './get-started'

export type AdLandingVariant = 'discovery' | 'consultation'

/** One rendered line of the address block. `strong` marks the venue heading
 *  lines — the bold treatment the old single-location block gave its title. */
export type AdLandingLine = { text: string; strong?: boolean }

export type AdLandingConfig = {
  variant: AdLandingVariant
  /** Hero eyebrow, exactly as supplied by NESTRE. */
  eyebrow: string
  /** Address block, exactly as supplied by NESTRE — one entry per rendered line. */
  locationLines: AdLandingLine[]
  /** Set on the discovery pages only: the quiz every CTA on the page opens. */
  surveyId?: string
  /** The two locations every CTA's "Choose your location." menu offers. Used by
   *  every CTA on the consultation pages, and as the discovery pages' fallback
   *  if `surveyId` is ever unset (the quiz does its own scheduling handoff). */
  bookLocations: ConsultLocation[]
  /** CTA label — repeated in the header, hero, consultation card and closing band. */
  ctaLabel: string
  /** Heading of the closing band, which is also what the goal chips scroll to. */
  ctaAnchor: string
}

const LNPC_BOOK = 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663934/calendar/5959541?appointmentTypeIds[]=96663934'
const NEUROVATIONS_BOOK = 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663987/calendar/12875091?appointmentTypeIds[]=96663987'

const DISCOVERY_LABEL = 'Book a complimentary discovery call'
const CONSULTATION_LABEL = 'Book initial NESTRE consultation'

// One eyebrow for both variants now that each page carries both locations.
const EYEBROW = 'Your Initial Consultation · Lake Nona · Winter Park'

// The location menu these pages open: the same two entries (and the same names
// and sublines) as the main site's Book Now menu, pointing at the two initial-
// consultation calendars rather than the training catalog links.
const AD_BOOK_LOCATIONS: ConsultLocation[] = [
  { name: 'Lake Nona', sub: 'Orlando, FL', url: LNPC_BOOK },
  { name: 'Winter Park', sub: 'Winter Park, FL', url: NEUROVATIONS_BOOK },
]

const DISCOVERY: AdLandingConfig = {
  variant: 'discovery',
  eyebrow: EYEBROW,
  locationLines: [
    { text: 'We are located in 2 locations', strong: true },
    { text: 'Located at The Lake Nona Performance Club', strong: true },
    { text: '6775 Chopra Ter' },
    { text: 'Orlando, FL 32827' },
    { text: 'United States' },
    { text: 'Neurovations in Winter Park', strong: true },
    { text: '2200 Lee Rd' },
    { text: 'Winter Park, FL 32789' },
    { text: 'United States' },
  ],
  surveyId: CONSULT_SURVEY_ID,
  bookLocations: AD_BOOK_LOCATIONS,
  ctaLabel: DISCOVERY_LABEL,
  ctaAnchor: 'discovery-call',
}

const CONSULTATION: AdLandingConfig = {
  variant: 'consultation',
  eyebrow: EYEBROW,
  locationLines: [
    { text: 'Located at the', strong: true },
    { text: 'Lake Nona Performance Club', strong: true },
    { text: '6775 Chopra Ter' },
    { text: 'Orlando, FL 32827' },
    { text: 'United States' },
    { text: 'Neurovations Clinic in Winter Park', strong: true },
    { text: '2200 Lee Rd' },
    { text: 'Winter Park, FL 32789' },
    { text: 'United States' },
  ],
  bookLocations: AD_BOOK_LOCATIONS,
  ctaLabel: CONSULTATION_LABEL,
  ctaAnchor: 'book-consultation',
}

// Both URLs of a pair render the same combined page.
export const AD_LANDING: Record<string, AdLandingConfig> = {
  '/lnpc-discovery-call': DISCOVERY,
  '/neurovations-discovery-call': DISCOVERY,
  '/lnpc-consultation': CONSULTATION,
  '/neurovations-consultation': CONSULTATION,
}

// The pair shares one title/description: the pages are identical and location
// neutral, and they stay noindex and out of the sitemap (ads traffic only).
export const AD_LANDING_META: Record<AdLandingVariant, Metadata> = {
  discovery: {
    title: { absolute: 'NESTRE · Your Initial Consultation · Lake Nona · Winter Park' },
    description:
      'Know your mind. Book a complimentary discovery call about the NESTRE Initial Consultation at the Lake Nona Performance Club or Neurovations in Winter Park, Florida.',
    robots: { index: false, follow: false },
  },
  consultation: {
    title: { absolute: 'NESTRE · Book Your Initial Consultation · Lake Nona · Winter Park' },
    description:
      'Know your mind. Book your initial NESTRE consultation at the Lake Nona Performance Club or the Neurovations Clinic in Winter Park, Florida.',
    robots: { index: false, follow: false },
  },
}
