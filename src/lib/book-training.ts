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
