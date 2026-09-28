// Single source of truth for the Neuro Lab get-started landing pages: the Acuity
// booking link each one's CTAs drive to. Used by the page configs (GetStartedBody)
// and by SiteHeader (which renders a stripped header — logo + Book only — on these
// pages). Keep the two pages' links here so they can never drift apart.
export const GET_STARTED: Record<string, { location: string; bookUrl: string }> = {
  '/get-started-at-neurovations': {
    location: 'Neurovations',
    bookUrl: 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663987/calendar/12875091?appointmentTypeIds[]=96663987',
  },
  '/get-started-at-lnpc': {
    location: 'Lake Nona Performance Club',
    bookUrl: 'https://app.acuityscheduling.com/schedule/1f29f701/appointment/96663934/calendar/5959541?appointmentTypeIds[]=96663934',
  },
}
