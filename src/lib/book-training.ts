// Per-location "Book Training" Acuity links (catalog add-to-cart). One booking
// link per NESTRE location — used by the LocationsMap "Book Training" CTA (home +
// /neuro-labs) and by each location's schedule page. Keep the mapping here so the
// cards, the schedule pages, and anywhere else can never drift apart.
const BOOK_TRAINING_BY_NAME: Record<string, string> = {
  'lake nona': 'https://app.acuityscheduling.com/catalog.php?owner=23912005&action=addCart&clear=1&id=2112997',
  'winter park': 'https://app.acuityscheduling.com/catalog.php?owner=23912005&action=addCart&clear=1&id=2112998',
  'monterey': 'https://app.acuityscheduling.com/catalog.php?owner=23912005&action=addCart&clear=1&id=2113000',
}

// Match by the location's leading name token (handles "Lake Nona Performance Club",
// "Monterey, CA", etc.).
export function bookTrainingUrl(name?: string): string | null {
  const n = (name || '').trim().toLowerCase()
  if (!n) return null
  const hit = Object.keys(BOOK_TRAINING_BY_NAME).find((k) => n.startsWith(k) || n.includes(k))
  return hit ? BOOK_TRAINING_BY_NAME[hit] : null
}

// The three NESTRE locations, in display order. Single source for the booking
// dropdown, the location cards' "View Location" links, and the schedule-page hero
// images. `page` = that location's schedule landing page; `image` = its photo.
export type BookLocation = { name: string; sub: string; url: string; page: string; image: string }
export const BOOK_LOCATIONS: BookLocation[] = [
  { name: 'Lake Nona', sub: 'Orlando, FL', url: BOOK_TRAINING_BY_NAME['lake nona'], page: '/schedule-with-nestre-at-lake-nona-performance-club', image: '/api/media/file/lnpc-lake-nona.jpg' },
  { name: 'Winter Park', sub: 'Winter Park, FL', url: BOOK_TRAINING_BY_NAME['winter park'], page: '/schedule-with-nestre-at-neurovations-clinic', image: '/api/media/file/lab-winter-park-building.jpg' },
  { name: 'Monterey', sub: 'Monterey, CA', url: BOOK_TRAINING_BY_NAME['monterey'], page: '/schedule-with-nestre-in-monterey', image: '/api/media/file/lab-monterey.jpg' },
]

// Look up a location by leading-name match (handles "Lake Nona Performance Club" etc.).
export function bookLocation(name?: string): BookLocation | null {
  const n = (name || '').trim().toLowerCase()
  if (!n) return null
  return BOOK_LOCATIONS.find((l) => n.startsWith(l.name.toLowerCase()) || n.includes(l.name.toLowerCase())) || null
}
