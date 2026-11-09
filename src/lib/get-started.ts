// Single source of truth for the Neuro Lab get-started landing pages: the Acuity
// booking link each one's CTAs drive to. Used by the page configs (GetStartedBody)
// and by SiteHeader (which renders a stripped header — logo + Book only — on these
// pages). Keep the two pages' links here so they can never drift apart.
// `surveyId`, when set, makes every "Book My Consultation" on that page — the
// header button and the body CTAs — open a modal embedding that LeadConnector
// survey instead of linking straight to Acuity. Only the two get-started ad pages
// opt in; the event-offer pages below keep the direct Acuity link.
export const CONSULT_SURVEY_ID = 'mv5AS1Oz0FlQ4bJPgMCV'
export const GET_STARTED: Record<string, { location: string; bookUrl: string; surveyId?: string; priceNow?: string; priceWas?: string }> = {
  '/get-started-at-neurovations': {
    location: 'Neurovations',
    bookUrl: 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663987/calendar/12875091?appointmentTypeIds[]=96663987',
    surveyId: CONSULT_SURVEY_ID,
  },
  '/get-started-at-lnpc': {
    location: 'Lake Nona Performance Club',
    bookUrl: 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663934/calendar/5959541?appointmentTypeIds[]=96663934',
    surveyId: CONSULT_SURVEY_ID,
  },
  // Event consultation offer pages — duplicates of the two get-started pages with
  // the event-specific Acuity booking links (provided by NESTRE, 2026-10-05).
  '/neurovations-event-consultation-offer': {
    location: 'Neurovations',
    bookUrl: 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/99094513/calendar/12875091?appointmentTypeIds[]=99094513',
  },
  '/lnpc-event-consultation-offer': {
    location: 'Lake Nona Performance Club',
    bookUrl: 'https://app.acuityscheduling.com/schedule.php?owner=23912005&appointmentType=99094479',
  },
}
