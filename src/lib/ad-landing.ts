// Ad landing pages — the discovery-call / consultation-booking A/B test.
//
// Four paid-traffic pages built from the approved prototypes (Chloe, Nov 2026):
// the same page, split only by what the CTA does. The DISCOVERY variant opens the
// LeadConnector quiz popup (the one with Chloe's photo and the resized headline —
// see SurveyModal / survey-widget); the CONSULTATION variant links straight to
// that location's Acuity calendar. Everything else — copy, sections, order — is
// identical, so the test measures the CTA and nothing else.
//
// Each location appears once per variant, so a page is (location × variant).
// SiteHeader reads this map to render the stripped header (logo + the page's own
// CTA, no nav), and the layout hides the marketing footer on these paths — the
// prototypes carry only a one-line footer, which AdLandingBody renders itself.
import { CONSULT_SURVEY_ID } from './get-started'

export type AdLandingVariant = 'discovery' | 'consultation'

export type AdLandingConfig = {
  variant: AdLandingVariant
  /** Venue name in the hero eyebrow ("Your initial consultation · …"). */
  venue: string
  /** Bold first line of the location block. */
  locationTitle: string
  /** Address lines under it, exactly as supplied by NESTRE. */
  locationLines: string[]
  /** This location's Acuity calendar. The consultation CTA links straight here.
   *  The discovery pages keep it as the fallback their CTA falls back to if
   *  `surveyId` is ever unset (the quiz does its own scheduling handoff). */
  bookUrl: string
  /** Set on the discovery pages only: the quiz every CTA on the page opens. */
  surveyId?: string
  /** CTA label — repeated in the header, hero, consultation card and closing band. */
  ctaLabel: string
  /** Heading of the closing band, which is also what the goal chips scroll to. */
  ctaAnchor: string
}

const LNPC_BOOK = 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663934/calendar/5959541?appointmentTypeIds[]=96663934'
const NEUROVATIONS_BOOK = 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663987/calendar/12875091?appointmentTypeIds[]=96663987'

const DISCOVERY_LABEL = 'Book a complimentary discovery call'
const CONSULTATION_LABEL = 'Book initial NESTRE consultation'

const LNPC = {
  venue: 'Lake Nona Performance Club',
  locationTitle: 'Located at the Lake Nona Performance Club',
  locationLines: ['6775 Chopra Terrace, Orlando, FL 32827', 'Precision RX · Second floor'],
  bookUrl: LNPC_BOOK,
}

const NEUROVATIONS = {
  venue: 'Neurovations',
  locationTitle: 'Located at Neurovations',
  locationLines: ['2200 Lee Rd, Winter Park, FL 32789, United States'],
  bookUrl: NEUROVATIONS_BOOK,
}

export const AD_LANDING: Record<string, AdLandingConfig> = {
  '/lnpc-discovery-call': {
    ...LNPC,
    variant: 'discovery',
    surveyId: CONSULT_SURVEY_ID,
    ctaLabel: DISCOVERY_LABEL,
    ctaAnchor: 'discovery-call',
  },
  '/lnpc-consultation': {
    ...LNPC,
    variant: 'consultation',
    ctaLabel: CONSULTATION_LABEL,
    ctaAnchor: 'book-consultation',
  },
  '/neurovations-discovery-call': {
    ...NEUROVATIONS,
    variant: 'discovery',
    surveyId: CONSULT_SURVEY_ID,
    ctaLabel: DISCOVERY_LABEL,
    ctaAnchor: 'discovery-call',
  },
  '/neurovations-consultation': {
    ...NEUROVATIONS,
    variant: 'consultation',
    ctaLabel: CONSULTATION_LABEL,
    ctaAnchor: 'book-consultation',
  },
}
