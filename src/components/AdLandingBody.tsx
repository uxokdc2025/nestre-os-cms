import React from 'react'
import { Reveal } from './Reveal'
import { GtmTag } from './Tracking'
import { SurveyCtaButton } from './SurveyModal'
import { ConsultPopover } from './ConsultPopover'
import { MindsetRingCard } from './MindsetRingCard'
import { AdLandingRail } from './AdLandingRail'
import { AdLandingGoals } from './AdLandingGoals'
import { PersonaVideo } from './PersonaVideo'
import { ArrowIcon } from './ArrowIcon'
import type { AdLandingConfig } from '@/lib/ad-landing'
import {
  CONSULTATION,
  CONSULT_CARD_NOTE,
  CTA_SUPPORT,
  EXPERIENCE,
  GOALS,
  HERO,
  LOGO_STRIP,
  LOGO_STRIP_ALT,
  PERSONAS,
  PRICE,
  SAMPLE_REPORT,
  SESSIONS,
  STORIES,
  STORIES_NOTE,
} from '@/lib/ad-landing-content'

// Ad landing page body, rebuilt from the approved prototypes on our own design
// system — same sections, order and copy, drawn with our tokens, our scorecard
// (bars grow / numbers count up via Carousels.tsx), our Mindset ring and our
// reveal motion. One component serves both A/B variants: `cfg.surveyId` makes
// every CTA open the LeadConnector quiz popup (discovery), otherwise they open
// the site's "Choose your location." menu over the two initial-consultation
// calendars (consultation).

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// The offer always reads as the current price against the regular one, so any
// mention of the old price in the ad copy renders struck through.
const strikeWas = (line: string) => {
  const parts = line.split(PRICE.was)
  if (parts.length === 1) return line
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <s className="adl-was">{PRICE.was}</s>}
      {part}
    </React.Fragment>
  ))
}

// Sample-report metric colours, taken from the approved prototype (one hue per
// row, the number badge matching its bar). See the scorecard section in CSS.
const METRIC_COLORS = ['#e532ca', '#6fecfb', '#74fb52', '#36d979']

export function AdLandingBody({ cfg }: { cfg: AdLandingConfig }) {
  const support = CTA_SUPPORT[cfg.variant]

  // The page's one conversion action, rendered in the hero, the consultation
  // card and the closing band. Discovery opens the quiz; consultation opens the
  // location menu — both calendars are in the HTML, the menu just reveals them.
  const Cta = ({ className = 'btn aqua adl-cta' }: { className?: string }) =>
    cfg.surveyId ? (
      <SurveyCtaButton surveyId={cfg.surveyId} label={cfg.ctaLabel} className={className} title={cfg.ctaLabel} icon={<ArrowIcon />} />
    ) : (
      <ConsultPopover
        label={cfg.ctaLabel}
        className={className}
        locations={cfg.bookLocations}
        icon={<ArrowIcon />}
        prerender
        detached
      />
    )

  return (
    <main id="main" data-page="ad-landing">
      <GtmTag />

      {/* Hero */}
      <section className="adl-hero">
        <div className="adl-hero-photo">
          <img src={HERO.photo} alt={HERO.photoAlt} fetchPriority="high" decoding="async" />
        </div>
        <div className="wrap adl-hero-inner">
          <p className="eyebrow">{cfg.eyebrow}</p>
          <h1 className="adl-h1">
            {HERO.headline[0]}
            <br />
            {HERO.headline[1]}
          </h1>
          <p className="adl-lead">{HERO.lead}</p>
          <div className="adl-panels">
            {HERO.panels.map((p) => (
              <div key={p.slice(0, 24)} className="adl-panel"><p>{p}</p></div>
            ))}
          </div>
          <div className="adl-cta-row"><Cta /></div>
          <p className="adl-support">
            {support.map((line, i) => (
              <React.Fragment key={line}>
                {i > 0 && <br />}
                {i === 0 && cfg.variant === 'consultation' ? <strong>{strikeWas(line)}</strong> : strikeWas(line)}
              </React.Fragment>
            ))}
          </p>
        </div>
      </section>

      {/* Press strip */}
      <section className="adl-trust">
        <div className="wrap">
          <img className="adl-logos" src={LOGO_STRIP} alt={LOGO_STRIP_ALT} loading="lazy" decoding="async" />
        </div>
      </section>

      {/* NESTRE is for — client stories */}
      <section className="adl-people">
        <div className="wrap adl-people-wrap">
          <AdLandingRail
            heading={<h2 className="adl-rail-h">NESTRE is for</h2>}
            ariaLabel="NESTRE client stories"
            className="adl-people-track"
          >
            {PERSONAS.map((p) => (
              <article key={p.label} className="adl-person">
                <div className="adl-person-stage">
                  {p.video ? (
                    // MP4 + poster. Carousels.tsx plays any <main> video muted +
                    // looping once in view; PersonaVideo adds the tap-to-play
                    // fallback for when a browser refuses autoplay outright.
                    <PersonaVideo src={p.video} poster={p.poster} label={p.alt} />
                  ) : (
                    <img src={p.poster} alt={p.alt} loading="lazy" decoding="async" />
                  )}
                  <h3 className="adl-person-label">{p.label}</h3>
                </div>
              </article>
            ))}
          </AdLandingRail>
        </div>
      </section>

      {/* What the consultation is + the illustrative sample report */}
      <section className="adl-consult" id="consultation">
        <div className="wrap adl-split">
          <div className="adl-split-copy">
            <h2 className="h2">
              {CONSULTATION.headline[0]}
              <br />
              {CONSULTATION.headline[1]}
            </h2>
            <p className="adl-intro">{CONSULTATION.intro}</p>
            <p className="adl-includes-label">{CONSULTATION.includesLabel}</p>
            <ul className="adl-includes">
              {CONSULTATION.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="adl-facts">
              {CONSULTATION.facts.map((f) => (
                <div key={f.value}>
                  <strong>
                    {f.value}
                    {/* The offer price sits against the regular one, struck through. */}
                    {f.was && <s className="adl-was">{f.was}</s>}
                  </strong>
                  {f.label}
                </div>
              ))}
            </div>
            {/* Both locations, one line per supplied line: the venue headings
                keep the bold treatment, the address lines sit under them. */}
            <p className="adl-location">
              {cfg.locationLines.map((line, i) =>
                line.strong ? <strong key={i}>{line.text}</strong> : <span key={i}>{line.text}</span>,
              )}
            </p>
            <p className="adl-footnote">{CONSULTATION.footnote}</p>
            <div className="adl-cta-row"><Cta className="btn solid adl-cta" /></div>
            {cfg.variant === 'consultation' && <p className="adl-consult-note">{strikeWas(CONSULT_CARD_NOTE)}</p>}
          </div>

          <div className="adl-split-aside">
            <div className="adl-score">
              <div className="adl-score-top">
                <strong>NESTRE</strong>
                <span className="adl-score-tag">{SAMPLE_REPORT.badge}</span>
              </div>
              <h3 className="adl-score-title">{SAMPLE_REPORT.title}</h3>
              <p className="adl-score-sub">{SAMPLE_REPORT.caption}</p>
              {/* Site scorecard markup: Carousels.tsx grows the bars and counts
                  the numbers up once the card scrolls into view. */}
              <div className="statcard adl-score-metrics">
                {SAMPLE_REPORT.metrics.map((m, i) => (
                  <div
                    key={m.label}
                    className="statrow"
                    style={{ ['--metric-color' as string]: METRIC_COLORS[i % METRIC_COLORS.length] } as React.CSSProperties}
                  >
                    <div className="lab">{m.label}</div>
                    <div className="statrow-line">
                      <div className="bar"><i style={{ ['--w' as string]: `${m.score}%`, ['--r' as string]: i } as React.CSSProperties} /></div>
                      <span className="stat-num" data-n={m.score} style={{ ['--r' as string]: i } as React.CSSProperties}>0</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="adl-score-foot">
                <MindsetRingCard values={SAMPLE_REPORT.mindset} title={null} className="adl-ring" animateIn />
                <p className="adl-ring-label">{SAMPLE_REPORT.mindsetLabel}</p>
              </div>
            </div>
            <p className="adl-caption">{SAMPLE_REPORT.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* What would you like to train for? */}
      <section className="adl-goals">
        <div className="wrap">
          <h2 className="h2">
            {GOALS.headline[0]}
            <br />
            {GOALS.headline[1]}
          </h2>
          {/* Chips glide down to the closing band rather than jumping (mobile). */}
          <AdLandingGoals choices={GOALS.choices} anchor={cfg.ctaAnchor} />
          <p className="adl-subtle">{GOALS.closing}</p>
        </div>
      </section>

      {/* From NEURO to Strength */}
      <section className="adl-how">
        <div className="wrap">
          <p className="eyebrow">{EXPERIENCE.eyebrow}</p>
          <h2 className="h2 adl-how-h">{EXPERIENCE.headline}</h2>
          <p className="adl-subtle">{EXPERIENCE.sub}</p>
          <div className="adl-how-grid">
            {EXPERIENCE.steps.map((s) => (
              <article key={s.title} className="adl-how-card">
                <img className="adl-how-photo" src={s.image} alt={s.alt} loading="lazy" decoding="async" />
                <div className="adl-how-body">
                  <p className="eyebrow">{s.step}</p>
                  <h3>{s.title}</h3>
                  <p className="adl-how-line">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Your NESTRE sessions */}
      <section className="adl-sessions" id="sessions">
        <div className="wrap">
          <img className="adl-session-banner" src={SESSIONS.banner} alt={SESSIONS.bannerAlt} loading="lazy" decoding="async" />
          <p className="eyebrow adl-sessions-eyebrow">{SESSIONS.eyebrow}</p>
          <h2 className="h2">
            {SESSIONS.headline[0]}
            <br />
            {SESSIONS.headline[1]}
          </h2>
          <p className="adl-intro">{SESSIONS.intro}</p>
          <div className="adl-session-grid">
            {SESSIONS.items.map((s) => (
              <details key={s.title} className={`adl-session${s.featured ? ' featured' : ''}`}>
                <summary>
                  <div>
                    <strong>
                      {s.title} <span className="adl-minutes">{s.minutes}</span>
                    </strong>
                    <small>{s.tagline}</small>
                  </div>
                  <span className="adl-plus" aria-hidden><PlusIcon /></span>
                </summary>
                <div className="adl-session-body"><p>{s.body}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="adl-stories">
        <div className="wrap">
          <AdLandingRail ariaLabel="Testimonials" className="adl-story-track">
            {STORIES.map((s) => (
              <article key={s.name} className="adl-story">
                <img className="adl-story-photo" src={s.photo} alt={s.alt} loading="lazy" decoding="async" />
                <blockquote>{s.quote}</blockquote>
                <cite>
                  {s.name}
                  <small>
                    {s.credits.map((c, i) => (
                      <React.Fragment key={c}>
                        {i > 0 && <br />}
                        {c}
                      </React.Fragment>
                    ))}
                  </small>
                </cite>
                {s.links && (
                  <div className="adl-story-links">
                    {s.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.ariaLabel}>
                        <span>{l.label}</span>
                        <ArrowIcon />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </AdLandingRail>
          <p className="adl-support">{STORIES_NOTE}</p>
        </div>
      </section>

      {/* Closing CTA — the goal chips above scroll here */}
      <section className="adl-final" id={cfg.ctaAnchor}>
        <div className="wrap">
          <h2 className="h2">{cfg.ctaLabel}</h2>
          <p className="adl-final-sub">
            {support.map((line, i) => (
              <React.Fragment key={line}>
                {i > 0 && <br />}
                {i === 0 && cfg.variant === 'consultation' ? <strong>{strikeWas(line)}</strong> : strikeWas(line)}
              </React.Fragment>
            ))}
          </p>
          <div className="adl-cta-row"><Cta /></div>
        </div>
      </section>

      {/* The prototypes carry a one-line footer only — the marketing footer is
          hidden on these paths (see the (frontend) layout). */}
      <footer className="adl-footer">
        <div className="wrap">
          <span>© {new Date().getFullYear()} NESTRE Health &amp; Performance</span>
          <a href="https://nestreperformance.com" target="_blank" rel="noopener noreferrer">Visit NESTRE<ArrowIcon /></a>
        </div>
      </footer>

      <Reveal />
    </main>
  )
}
