import { headers, cookies } from 'next/headers'
import type { Region } from './consult-pricing'

// Region detection for consult pricing. Monterey (CA) consults are priced
// differently ($500) from the Florida labs ($300, $250 promo). Vercel injects
// the visitor's geo on every request (x-vercel-ip-* headers); a `nestre-region`
// cookie set by the on-page toggle always wins so anyone can correct a wrong IP
// guess. Callers must be dynamically rendered (the catch-all is force-dynamic)
// so the headers/cookie are read per request, never cached.
//
// next/headers makes this server-only; keep it out of components that get bundled
// for the client (RenderBlocks stays clean — pages read the region and pass it in).

export async function getRegion(): Promise<Region> {
  const override = (await cookies()).get('nestre-region')?.value
  if (override === 'monterey' || override === 'default') return override

  const h = await headers()
  const country = h.get('x-vercel-ip-country')
  const region = h.get('x-vercel-ip-country-region')
  // California is the only state with a NESTRE Neuro Lab (Monterey), so CA → $500.
  if (country === 'US' && region === 'CA') return 'monterey'
  return 'default'
}
