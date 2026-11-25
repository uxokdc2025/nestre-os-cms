import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { Mulish } from 'next/font/google'
import { SITE_URL, pageGraphs } from '@/lib/seo'
import { HOLIDAY_CAMPAIGN as C, holidayDisclaimer, type HolidayImage } from '@/lib/holiday-campaign'
import { HolidayMotion } from './HolidayMotion'
import './holiday.css'

// Holiday landing page (Chloe, updated Nov 25 2026). All copy, offer, gift,
// testimonials, disclaimer and photos come from src/lib/holiday-campaign.ts —
// edit that file for the next holiday. Markup mirrors the approved reference
// design; classes carry an `nh-` prefix so styles can't leak into the rest of the site.

const mulish = Mulish({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-mulish', display: 'swap' })

export const metadata: Metadata = {
  title: { absolute: C.meta.title },
  description: C.meta.description,
  alternates: { canonical: `${SITE_URL}${C.path}` },
  openGraph: {
    title: C.meta.title,
    description: C.meta.description,
    type: 'website',
    siteName: 'NESTRE',
    url: `${SITE_URL}${C.path}`,
    images: [{ url: C.hero.image.src, width: C.hero.image.width, height: C.hero.image.height, alt: C.hero.image.alt }],
  },
}

const REVEAL_BOOT = "(function(){try{var r=document.currentScript.parentElement;if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('nh-reveal-ready')}catch(e){}})()"

// Sparkle positions copied from the reference hero.
const SPARKLES: [number, number, number][] = [
  [49, 15, 0], [57, 36, 1], [67, 12, 2], [78, 27, 3], [92, 16, 4], [96, 53, 0],
  [53, 74, 1], [64, 85, 2], [84, 80, 3], [72, 58, 4], [89, 43, 0], [45, 47, 1],
]

function Book({ className = 'nh-btn nh-booking', label = C.ctaLabel }: { className?: string; label?: string }) {
  return (
    <a className={className} href={C.bookingUrl} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  )
}

function DualCtas({ className }: { className: string }) {
  return (
    <div className={className}>
      <a className="nh-btn nh-booking" href={C.bookingUrl} target="_blank" rel="noopener noreferrer">
        {C.ctaLabel}
      </a>
      <span className="nh-or">{C.orLabel}</span>
      <a className="nh-btn nh-gift-button" href={C.giftUrl} target="_blank" rel="noopener noreferrer">
        {C.giftLabel}
      </a>
    </div>
  )
}

function Lines({ text }: { text: string }) {
  const parts = text.split('|')
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {p.trim()}
        </span>
      ))}
    </>
  )
}

function GoalCard({ title, image, clone }: { title: string; image: HolidayImage; clone?: boolean }) {
  return (
    <a
      className="nh-goal-card"
      href={C.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={clone ? true : undefined}
      tabIndex={clone ? -1 : undefined}
      data-clone={clone ? '' : undefined}
    >
      <div className="nh-goal-photo nh-reveal-item">
        <img
          loading={clone ? 'eager' : 'lazy'}
          decoding="async"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
      </div>
      <h3>{title}</h3>
      <span className="nh-goal-link nh-btn">{C.ctaLabel}</span>
    </a>
  )
}

export default function HolidayPage() {
  const p = C.dataSample.profile
  return (
    // suppressHydrationWarning: the inline script below adds .nh-reveal-ready to
    // this element before first paint so revealed sections don't flash.
    <div className={`nh-page ${mulish.variable}`} data-holiday-page="" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageGraphs(C.meta.title, C.path, C.meta.description)) }} />
      <header>
        <Link href="/" prefetch={false} className="nh-logo" aria-label="NESTRE home">
          <img src="/holiday/nestre-logo.png" alt="NESTRE — A Neuro-Strength Company" width={1440} height={422} />
        </Link>
        <Book />
      </header>
      <main id="main">
        <section className="nh-hero" aria-label="NESTRE holiday offer">
          {C.hero.sparkles && (
            <span className="nh-hero-sparkles" aria-hidden="true">
              {SPARKLES.map(([l, t, d], i) => (
                <i key={i} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `-${d}s` }} />
              ))}
            </span>
          )}
          <div className="nh-reveal-item">
            <div className="nh-eyebrow" id="nh-occasion">{C.hero.eyebrow}</div>
            <h1 id="nh-headline"><Lines text={C.hero.headline} /></h1>
            <p id="nh-intro">{C.hero.intro}</p>
            {C.hero.offer && (
              <div id="nh-campaignOffer">
                <h2 className="nh-holiday-message">
                  {C.hero.offer.line}
                  <br />
                  <strong>{C.hero.offer.highlight}</strong>
                </h2>
              </div>
            )}
            <DualCtas className="nh-hero-actions" />
          </div>
          <figure>
            <img src={C.hero.image.src} width={C.hero.image.width} height={C.hero.image.height} alt={C.hero.image.alt} fetchPriority="high" style={C.hero.image.objectPosition ? { objectPosition: C.hero.image.objectPosition } : undefined} />
          </figure>
        </section>

        <section className="nh-consult" id="consultation">
          <div className="nh-consult-overview">
            <div className="nh-price-panel nh-reveal-item">
              <p className="nh-offer-caption">{C.offer.caption}</p>
              <div className="nh-offer-price">
                <span>{C.offer.label}</span>
                <p className="nh-session-duration">
                  <strong>{C.offer.duration}</strong>
                  <br />
                  {C.offer.durationDetail}
                </p>
                {C.offer.valueText && <span><s>{C.offer.valueText}</s></span>}
                <strong>{C.offer.priceText}</strong>
              </div>
              <Book />
            </div>
            <div className="nh-starting-panel nh-reveal-item">
              <h2 id="nh-offerTitle">{C.offer.title}</h2>
              <p className="nh-description" id="nh-offerBody">{C.offer.body}</p>
              <p className="nh-invitation">{C.offer.invitation}</p>
              <p className="nh-promo" id="nh-promoLine">
                {C.offer.promoCode ? <>Use code <strong>{C.offer.promoCode}</strong> at checkout.</> : null}
              </p>
              <p className="nh-terms" id="nh-termsLine">{C.offer.terms}</p>
            </div>
          </div>
          <div className="nh-consult-details">
            <div className="nh-includes nh-reveal-item">
              <h3>{C.includes.heading}</h3>
              <ul>
                {C.includes.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
              <p className="nh-training-bonus">{C.includes.bonus}</p>
              <div className="nh-inline-locations nh-reveal-item" id="locations">
                <h4>{C.locations.heading}</h4>
                {C.locations.places.map((pl) => (
                  <div key={pl.name}>
                    <strong>{pl.name}</strong>
                    <address>
                      {pl.lines.map((ln, i) => <span key={i}>{i > 0 && <br />}{ln}</span>)}
                    </address>
                  </div>
                ))}
              </div>
              <div className="nh-gift-purchase">
                <h3>{C.gift.heading}</h3>
                <p className="nh-gift-intro">{C.gift.intro}</p>
                <p className="nh-gift-description">{C.gift.description}</p>
                <DualCtas className="nh-gift-actions" />
              </div>
            </div>
            <aside className="nh-data-sample nh-reveal-item" aria-labelledby="nh-data-title">
              <div className="nh-sample-top">
                <strong>NESTRE</strong>
                <span>Illustrative sample</span>
              </div>
              <h3 id="nh-data-title">{C.dataSample.title}</h3>
              <p>{C.dataSample.body}</p>
              {C.dataSample.metrics.map((m) => (
                <div key={m.label} className="nh-data-row" style={{ '--metric': m.color, '--score': `${m.score}%` } as CSSProperties}>
                  <div className="nh-metric-label">{m.label}</div>
                  <div className="nh-metric-line">
                    <div className="nh-metric-track"><span /></div>
                    <strong data-target={m.score}>{m.score}</strong>
                  </div>
                </div>
              ))}
              <div className="nh-mindset-sample">
                <div className="nh-profile-ring" role="img" aria-label={`Illustrative Mindset Profile: Cerebral ${p.cerebral} percent, Alpha ${p.alpha} percent, Prime ${p.prime} percent.`}>
                  <svg viewBox="0 0 420 330" aria-hidden="true">
                    <defs>
                      <linearGradient id="nhProfileGrad0" gradientUnits="userSpaceOnUse" x1="190" y1="55" x2="305" y2="134"><stop stopColor="#00c9ed" /><stop offset="1" stopColor="#00ee63" /></linearGradient>
                      <linearGradient id="nhProfileGrad1" gradientUnits="userSpaceOnUse" x1="305" y1="134" x2="210" y2="246"><stop stopColor="#00ee63" /><stop offset="1" stopColor="#00c9ed" /></linearGradient>
                      <linearGradient id="nhProfileGrad2" gradientUnits="userSpaceOnUse" x1="210" y1="246" x2="114" y2="160"><stop stopColor="#00c9ed" /><stop offset="1" stopColor="#e719cd" /></linearGradient>
                      <linearGradient id="nhProfileGrad3" gradientUnits="userSpaceOnUse" x1="114" y1="160" x2="190" y2="55"><stop stopColor="#e719cd" /><stop offset="1" stopColor="#00c9ed" /></linearGradient>
                    </defs>
                    <g className="nh-profile-drawing" fill="none" strokeWidth="6" strokeLinecap="round">
                      <path className="nh-profile-arc" d="M 190 55 A 96 96 0 0 1 305 134" pathLength={100} stroke="url(#nhProfileGrad0)" />
                      <path className="nh-profile-arc" d="M 305 134 A 96 96 0 0 1 210 246" pathLength={100} stroke="url(#nhProfileGrad1)" />
                      <path className="nh-profile-arc" d="M 210 246 A 96 96 0 0 1 114 160" pathLength={100} stroke="url(#nhProfileGrad2)" />
                      <path className="nh-profile-arc" d="M 114 160 A 96 96 0 0 1 190 55" pathLength={100} stroke="url(#nhProfileGrad3)" />
                    </g>
                    <circle className="nh-profile-boundary" cx="305" cy="134" r="9" stroke="#00ee63" style={{ color: '#00ee63' }} />
                    <circle className="nh-profile-boundary" cx="210" cy="246" r="9" stroke="#00c9ed" style={{ color: '#00c9ed' }} />
                    <circle className="nh-profile-boundary" cx="114" cy="160" r="9" stroke="#e719cd" style={{ color: '#e719cd' }} />
                  </svg>
                  <div className="nh-ring-logo">
                    <img src="/holiday/nestre-logo.png" alt="" width={1440} height={422} />
                  </div>
                  <div className="nh-profile-scores">
                    <div className="nh-score-cerebral" style={{ '--profile': '#e719cd' } as CSSProperties}><strong data-target={p.cerebral}>{p.cerebral}%</strong><span>Cerebral</span></div>
                    <div className="nh-score-alpha" style={{ '--profile': '#00ee63' } as CSSProperties}><strong data-target={p.alpha}>{p.alpha}%</strong><span>Alpha</span></div>
                    <div className="nh-score-prime" style={{ '--profile': '#00c9ed' } as CSSProperties}><strong data-target={p.prime}>{p.prime}%</strong><span>Prime</span></div>
                  </div>
                </div>
                <p className="nh-profile-caption">{p.caption}</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="nh-goal-section" aria-labelledby="nh-goals-heading">
          <div className="nh-goals-heading nh-reveal-item">
            <div>
              <h2 id="nh-goals-heading">{C.goals.heading}</h2>
              <p>{C.goals.subheading}</p>
            </div>
            <div className="nh-goal-controls">
              <button type="button" id="nh-goalsPause" aria-pressed="false">Pause scrolling</button>
              <button type="button" id="nh-goalsPrevious" aria-label="Previous training goals">Previous</button>
              <button type="button" id="nh-goalsNext" aria-label="Next training goals">Next</button>
            </div>
          </div>
          <div className="nh-goal-track" id="nh-goalTrack" tabIndex={0} role="region" aria-label="Training goals photo carousel">
            {C.goals.cards.map((c) => <GoalCard key={c.title} {...c} />)}
            {/* Second copy for the seamless loop (hidden from assistive tech). */}
            {C.goals.cards.map((c) => <GoalCard key={`clone-${c.title}`} {...c} clone />)}
          </div>
          <div className="nh-goals-bottom">
            <span>{C.goals.hint}</span>
            <span id="nh-goalPosition" aria-live="polite">1 of {C.goals.cards.length}</span>
          </div>
        </section>

        <section className="nh-testimonials" aria-labelledby="nh-testimonials-title">
          <div className="nh-testimonials-heading nh-reveal-item">
            <h2 id="nh-testimonials-title">{C.testimonials.heading}</h2>
            <div className="nh-testimonial-controls">
              <button type="button" id="nh-testimonialPrevious" aria-label="Previous testimonial">Previous</button>
              <button type="button" id="nh-testimonialNext" aria-label="Next testimonial">Next</button>
            </div>
          </div>
          <div
            className="nh-testimonial-track"
            id="nh-testimonialTrack"
            tabIndex={0}
            role="region"
            aria-label="Client testimonials"
          >
            {C.testimonials.items.map((t) => (
              <article key={t.name} className="nh-testimonial-card" aria-label={`Testimonial from ${t.name}`}>
                <img
                  alt={t.image.alt}
                  width={t.image.width}
                  height={t.image.height}
                  loading="lazy"
                  src={t.image.src}
                  style={t.image.objectPosition ? { objectPosition: t.image.objectPosition } : undefined}
                />
                <blockquote>{t.quote}</blockquote>
                <div className="nh-testimonial-author">
                  <strong>{t.name}</strong>
                  <p>{t.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="nh-reveal-item">
        <strong>{C.footer.tagline}</strong>
        <div>
          {C.footer.areas}
          <br />
          <a href={`tel:${C.phone.tel}`}>{C.phone.display}</a>
        </div>
      </footer>
      <div className="nh-offer-disclaimer">{holidayDisclaimer(C)}</div>
      <HolidayMotion />
    </div>
  )
}
