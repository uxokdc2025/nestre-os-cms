import { getPayload } from 'payload'
import config from '@/payload.config'

// Shared header/footer chrome for standalone routes (privacy, news) that live
// outside the CMS [[...slug]] catch-all but still need the site nav + logo.
export async function getChrome() {
  const payload = await getPayload({ config: await config })
  const [nav, brand, footer] = await Promise.all([
    payload.findGlobal({ slug: 'nav', depth: 0 }).catch(() => null),
    payload.findGlobal({ slug: 'brand', depth: 1 }).catch(() => null),
    payload.findGlobal({ slug: 'footer', depth: 0 }).catch(() => null),
  ])
  return {
    nav: nav as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    footer: footer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    brand: brand as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    logoUrl: (brand as any)?.logoLight?.url as string | undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}
