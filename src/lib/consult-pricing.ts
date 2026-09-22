// Pure, isomorphic consult-pricing helpers — no next/headers, so this is safe to
// import from both server components and client bundles (RegionToggle, Puck).
// Region detection (which reads request headers) lives in geo-pricing.ts.

export type Region = 'monterey' | 'default'

/** The full, region-appropriate answer to "How much does the consult cost?". */
export function consultCostAnswer(region: Region): string {
  return region === 'monterey'
    ? 'The initial consultation at our Monterey Neuro Lab is $500. Pricing varies by location — see your NESTRE Neuro Lab’s scheduling page for details.'
    : 'The regular price is $300. For a limited time, new clients can schedule an initial consultation for $250 — a savings of $50. Pricing at our Monterey Neuro Lab differs.'
}

// Token authors can drop into CMS FAQ copy; the FAQ renderer swaps it for the
// region-aware sentence above.
export const CONSULT_COST_TOKEN = '{{consultCost}}'
