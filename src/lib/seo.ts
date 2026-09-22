// AI-SEO / GEO: static, server-rendered structured data + site constants.
// Domain cut over to nestreperformance.com (Sept 2026) — canonicals/sitemap/OG use it.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nestreperformance.com'
export const SITE_NAME = 'NESTRE'
export const ORG_ID = `${SITE_URL}/#org`
export const SITE_ID = `${SITE_URL}/#website`

export const abs = (path = '/') => (path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`)

const KNOWS_ABOUT = [
  'Cognitive performance',
  'Cognitive fitness',
  'NeuroStrength Training',
  'Neurofeedback',
  'Brain training',
  'Cognitive performance data',
  'Mental performance',
  'Executive function',
  'Mindset training',
  'Human performance',
]

const CONTACT = { email: 'info@nestreperformance.com', phone: '+1-689-710-3260' }

// Verified public profiles for the NESTRE entity — sameAs disambiguates the brand
// across the web so answer engines connect these to the Organization.
const APP_STORE_IOS = 'https://apps.apple.com/us/app/nestre-health-and-performance/id6443393462'
const APP_STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.nestreapp.prod'
const PODCAST_SPOTIFY = 'https://open.spotify.com/show/5rL7sOe1lvUmH814dzzbGp'
const PODCAST_APPLE = 'https://podcasts.apple.com/us/podcast/better-mind/id1825077930'
const OFFICIAL_SITE = 'https://nestreperformance.com'
const SAME_AS = [OFFICIAL_SITE, APP_STORE_IOS, APP_STORE_ANDROID, PODCAST_SPOTIFY, PODCAST_APPLE]

const LABS = [
  {
    name: 'NESTRE Neuro Lab — Lake Nona',
    street: '6775 Chopra Terrace',
    locality: 'Orlando', region: 'FL', postal: '32827', country: 'US',
    inside: 'Inside Lake Nona Performance Club',
  },
  {
    name: 'NESTRE Neuro Lab — Winter Park',
    locality: 'Winter Park', region: 'FL', country: 'US',
    inside: 'Winter Park, Florida',
  },
  {
    name: 'NESTRE Neuro Lab — Monterey',
    street: '5 Harris Ct, Building T, Suite 102',
    locality: 'Monterey', region: 'CA', postal: '93940', country: 'US',
    inside: 'Inside Terrapin Physical Therapy',
  },
]

/** Site-wide @graph: Organization + WebSite + the 3 Neuro Labs + the App. */
export function siteGraph() {
  const org = {
    '@type': ['Organization', 'MedicalBusiness'],
    '@id': ORG_ID,
    name: 'NESTRE Health & Performance',
    alternateName: 'NESTRE',
    url: SITE_URL,
    logo: abs('/api/media/file/wordmark-white.png'),
    description:
      'NESTRE turns cognitive performance data into personalized NeuroStrength Training — guided by a NeuroTrainer. A neuro-strength company for cognitive fitness and human performance.',
    email: CONTACT.email,
    telephone: CONTACT.phone,
    knowsAbout: KNOWS_ABOUT,
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT.email,
      telephone: CONTACT.phone,
      contactType: 'customer service',
    },
    foundingDate: '2018',
    sameAs: SAME_AS,
    founder: [
      { '@type': 'Person', name: 'Dr. Tommy Shavers' },
      { '@type': 'Person', name: 'Julius Thomas' },
    ],
  }

  const website = {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  }

  const labs = LABS.map((l, i) => ({
    '@type': 'MedicalBusiness',
    '@id': `${SITE_URL}/neuro-labs#lab-${i}`,
    name: l.name,
    parentOrganization: { '@id': ORG_ID },
    url: `${SITE_URL}/neuro-labs`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      ...(l.street ? { streetAddress: l.street } : {}),
      addressLocality: l.locality,
      addressRegion: l.region,
      ...(l.postal ? { postalCode: l.postal } : {}),
      addressCountry: l.country,
    },
    description: l.inside,
  }))

  const app = {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/the-app#app`,
    name: 'NESTRE App',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS, Android',
    publisher: { '@id': ORG_ID },
    description:
      'Daily cognitive workouts, mental framing (Frame It), Mindset Minutes, and Mindset Music — cognitive fitness for your everyday routine.',
    url: `${SITE_URL}/the-app`,
    sameAs: [APP_STORE_IOS, APP_STORE_ANDROID],
    downloadUrl: [APP_STORE_IOS, APP_STORE_ANDROID],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return { '@context': 'https://schema.org', '@graph': [org, website, ...labs, app] }
}

/** FAQPage built from a page's faq blocks (answer engines lift these verbatim). */
export function faqGraph(layout: any[]): object | null { // eslint-disable-line @typescript-eslint/no-explicit-any
  const items: { q: string; a: string }[] = []
  for (const b of layout || []) {
    if (b?.blockType === 'faq' && Array.isArray(b.items)) {
      for (const it of b.items) if (it?.q && it?.a) items.push({ q: it.q, a: it.a })
    }
  }
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}

/** WebPage + Breadcrumb JSON-LD for a standalone page (legal/support). Ties the
 *  page to the Organization/WebSite graph so answer engines place it in context. */
export function webPageGraph(name: string, path: string, description?: string): object {
  const url = abs(path)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name,
        ...(description ? { description } : {}),
        isPartOf: { '@id': SITE_ID },
        about: { '@id': ORG_ID },
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
    ],
  }
}
