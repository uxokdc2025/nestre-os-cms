import type { Region } from './consult-pricing'

// Region detection for consult pricing. With only the Florida Neuro Labs live
// (Lake Nona + Winter Park), there is a single pricing region, so this always
// resolves to 'default'. Kept as an async function returning Region so callers
// (the force-dynamic catch-all) don't need to change.
export async function getRegion(): Promise<Region> {
  return 'default'
}
