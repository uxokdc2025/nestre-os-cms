import React from 'react'
import Link from 'next/link'
import { PodcastPlayer } from './PodcastPlayer'
import { ClosingParallax } from './ClosingParallax'
import { PhoneShowcase } from './PhoneShowcase'
import { LocationsMap } from './LocationsMap'
import { MindsetRingCard } from './MindsetRingCard'

// Founder (Dr. Tommy Shavers) NESTRE Mindset Profile — shown in place of his photo
// in the Our Story "A different view…" section.
const FOUNDER_PROFILE = { cerebral: 0, alpha: 80, prime: 20 }

type Media = { url?: string | null; alt?: string | null } | string | null | undefined
type CTA = { label?: string; href?: string | null; style?: string }

const mediaUrl = (m: Media): string | null =>
  m && typeof m === 'object' && 'url' in m ? (m.url ?? null) : null
const mediaAlt = (m: Media): string =>
  m && typeof m === 'object' && 'alt' in m ? (m.alt ?? '') : ''
const isVideo = (url: string | null) => !!url && /\.(mp4|webm|mov)(\?|$)/i.test(url)

/** Renders a media url as a muted looping video if it's a video, else an image. */
function Visual({ url, alt, poster, className }: { url: string | null; alt?: string; poster?: string | null; className?: string }) {
  if (!url) return null
  if (isVideo(url))
    return (
      <video className={className} src={url} poster={poster || undefined} autoPlay muted loop playsInline preload="metadata" />
    )
  return <img className={className} src={url} alt={alt || ''} />
}

const isExternal = (href?: string | null) => !!href && /^https?:\/\//i.test(href)
const isInternal = (href?: string | null) => !!href && href.startsWith('/') && !href.startsWith('//')

// A feature row whose body is a JSON array of {label, score, accent?} renders as
// a readiness-scorecard card (labelled gradient bars) instead of a text card.
type Metric = { label: string; score: number; accent?: boolean }
const parseScorecard = (body?: string | null): Metric[] | null => {
  if (!body) return null
  const s = body.trim()
  if (s[0] !== '[') return null
  try {
    const arr = JSON.parse(s)
    return Array.isArray(arr) && arr.length && arr.every((m) => m && typeof m.score === 'number') ? arr : null
  } catch {
    return null
  }
}

function Buttons({ ctas }: { ctas?: CTA[] }) {
  // "What to Expect" was a placeholder CTA — removed per design.
  const list = ctas?.filter((c) => !/what to expect/i.test(c.label || ''))
  if (!list?.length) return null
  return (
    <div className="btns">
      {list.map((c, i) => {
        const cls = `btn ${c.style || 'aqua'}`
        return isInternal(c.href) ? (
          <Link key={i} className={cls} href={c.href!}>{c.label}</Link>
        ) : (
          <a key={i} className={cls} href={c.href || '#'} {...(isExternal(c.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {c.label}
          </a>
        )
      })}
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function Block({ block }: { block: any }) {
  switch (block.blockType) {
    case 'hero': {
      const isQuote = (block.subheading || '').trim().startsWith('—')
      return (
        <section className={`hero${isQuote ? ' quote' : ''}`}>
          {(mediaUrl(block.video) || mediaUrl(block.background)) && (
            <div className="bg">
              <Visual
                url={mediaUrl(block.video) || mediaUrl(block.background)}
                // When a hero video exists, DON'T use the old still as its poster —
                // it flashes the stale background image before the video paints.
                // The video shows its own first frame over the navy .hero bg instead.
                poster={mediaUrl(block.video) ? null : mediaUrl(block.background)}
                alt={mediaAlt(block.background)}
              />
            </div>
          )}
          <div className="grad" />
          <div className="wrap inner">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            <h1 style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{isQuote ? `“${block.heading}”` : block.heading}</h1>
            {block.subheading && <p className="subhead">{block.subheading}</p>}
            {block.body && <p className="lead muted" style={{ color: 'rgba(255,255,255,.75)' }}>{block.body}</p>}
            <Buttons ctas={block.ctas} />
          </div>
          <a href="#next" className="hero-more hero-scroll" aria-label="Scroll to next section">
            <span>Scroll</span>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </a>
        </section>
      )
    }
    case 'statScorecard': {
      const showRunner = /neck up|performance/i.test(block.eyebrow || '')
      const scorecard = block.stats?.length ? (
        <div className="statcard">
          {block.stats.map((s: any, i: number) => (
            <div key={i} className={`statrow ${s.accent ? 'accent' : ''} ${s.score < 90 ? 'low' : ''}`}>
              <div className="lab">{s.label}</div>
              <div className="statrow-line">
                <div className="bar"><i style={{ ['--w' as string]: `${s.score}%`, ['--r' as string]: i } as React.CSSProperties} /></div>
                <span className="stat-num" data-n={s.score} style={{ ['--r' as string]: i } as React.CSSProperties}>0</span>
              </div>
            </div>
          ))}
        </div>
      ) : null
      const copy = (
        <>
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
          {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
        </>
      )
      // Runner sections use a sticky-scroll: the copy + runner pin on the left in
      // full frame, then the scorecard rises in on the right (bars draw, numbers
      // scale + count up — driven by Carousels.tsx once the card is in view).
      const statSection = showRunner ? (
        <section className="sec paper stat-sticky">
          <div className="wrap sticky-rows">
            <div className="sticky-left">
              <div className="stat-left-inner">
                {copy}
                <img className="stat-runner-under" src="/img/runner.png" alt="An athlete mid-stride, powering forward" aria-hidden />
              </div>
            </div>
            <div className="stat-scroll">{scorecard}</div>
          </div>
        </section>
      ) : (
        <section className={`sec ${block.theme || 'paper'}`}>
          <div className="wrap cols">
            <div>{copy}</div>
            {scorecard ? <div className="stat-right">{scorecard}</div> : null}
          </div>
        </section>
      )
      return mediaUrl(block.logoStrip) ? (
        <>
          {statSection}
          <section className="sec paper logos-sec" aria-label="As referenced by">
            <div className="logo-marquee">
              <div className="logo-track">
                <img src={mediaUrl(block.logoStrip)!} alt={mediaAlt(block.logoStrip)} />
                <img src={mediaUrl(block.logoStrip)!} alt="" aria-hidden />
              </div>
            </div>
          </section>
        </>
      ) : statSection
    }
    case 'steps':
      return (
        <section className={`sec ${block.theme || 'navy'}`}>
          <div className="wrap">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
            <Buttons ctas={block.ctas} />
            <div className="steps">
              {block.steps?.map((s: any, i: number) => {
                const url = mediaUrl(s.image)
                // graphic dashboards (the review scorecard) must fit whole, not crop
                const fit = !!url && /ai-review|home-review|scorecard|readiness|motor/i.test(url)
                // full-bleed photos already framed to the card ratio — no base zoom
                const fill = !!url && /\/cards\/start/.test(url)
                return (
                  <div key={i} className="step">
                    <div className={`thumb${fit ? ' fit' : ''}${fill ? ' fill' : ''}`}>{url && <img src={url} alt={mediaAlt(s.image)} />}</div>
                    {s.kicker && <div className="kick">{s.kicker}</div>}
                    <h3>{s.title}</h3>
                    {s.body && <p className="muted" style={{ marginTop: 8 }}>{s.body}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )
    case 'mediaPanels':
      return (
        <section className={`sec ${block.theme || 'paper'}`}>
          <div className="wrap">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
            <Buttons ctas={block.ctas} />
            <div className="panels">
              {block.panels?.map((p: any, i: number) => (
                <div key={i} className="panel">
                  {mediaUrl(p.image) && <img src={mediaUrl(p.image)!} alt={mediaAlt(p.image)} />}
                  {p.caption && <div className="cap">{p.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    case 'appShowcase':
      return <PhoneShowcase block={block} />
    case 'podcast':
      return (
        <section className="sec navy">
          <div className="wrap">
            {block.heading && <h2 className="h2" style={{ whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.eyebrow && <p className="eyebrow" style={{ marginTop: 14 }}>{block.eyebrow}</p>}
            <PodcastPlayer videoUrl={mediaUrl(block.video) ?? undefined} posterUrl={mediaUrl(block.thumbnail) ?? undefined} alt={mediaAlt(block.thumbnail)} />
            <Buttons ctas={block.ctas} />
          </div>
        </section>
      )
    case 'closingCta': {
      // Portrait end-screen images for mobile (≤700px), keyed by the desktop bg file
      // so each closing section shows a version that fits a phone. Desktop unchanged.
      const MOBILE_END: Record<string, string> = {
        'footer.png': '/legacy/mobile-end/home.png',
        'pages-supplied-16.jpeg': '/legacy/mobile-end/how.png',
        'forest-breath.jpg': '/legacy/mobile-end/neuro.png',
      }
      const bgUrl = mediaUrl(block.background)
      const mobileEnd = bgUrl ? MOBILE_END[bgUrl.split('/').pop()!.split('?')[0]] : undefined
      return bgUrl ? (
        <ClosingParallax
          image={bgUrl}
          mobileImage={mobileEnd}
          alt={mediaAlt(block.background)}
          heading={block.heading}
          body={block.body}
          accentLine={block.accentLine}
          ctas={block.ctas}
          copyRight={block.copyRight ?? /bring the human/i.test(block.heading || '')}
        />
      ) : (
        <section className="sec navy closing">
          <div className="wrap">
            <h2 style={{ whiteSpace: 'pre-line' }}>{block.heading}</h2>
            {block.body && <p className="lead" style={{ color: 'rgba(255,255,255,.8)', fontSize: 22 }}>{block.body}</p>}
            {block.accentLine && <p className="eyebrow" style={{ marginTop: 22, letterSpacing: 0 }}>{block.accentLine}</p>}
            <Buttons ctas={block.ctas} />
          </div>
        </section>
      )
    }
    case 'featureRows': {
      const img = mediaUrl(block.image)
      // Sticky-scroll layout when there's an image + rows: the image pins while
      // the numbered cards scroll past it (image side alternates via block.reverse).
      const sticky = img && (block.rows?.length || 0) > 0
      if (sticky) {
        // Left column (heading + description + image) stays pinned; the numbered
        // cards scroll past it on the right. The narrow column wraps the heading.
        return (
          <section className={`sec ${block.theme || 'paper'}`}>
            <div className="wrap sticky-rows">
              <div className="sticky-left">
                <div className="sticky-left-inner">
                  {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
                  {block.heading && <h2 className="h2" style={{ marginTop: 14, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
                  {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
                  <div className="sticky-media-inner"><Visual url={img} alt={mediaAlt(block.image)} /></div>
                </div>
              </div>
              <div className="sticky-list">
                {block.rows.map((r: any, i: number) => {
                  const metrics = parseScorecard(r.body)
                  if (metrics) return (
                    <div key={i} className="feature-card scorecard-card" style={{ ['--i' as string]: i } as React.CSSProperties}>
                      {r.label && <span className="feature-step">{r.label}</span>}
                      {r.title && <h3>{r.title}</h3>}
                      <div className="scorecard-bars">
                        {metrics.map((m, j) => (
                          <div key={j} className={`statrow ${m.accent ? 'accent' : ''} ${m.score < 90 ? 'low' : ''}`}>
                            <div className="score-head"><span>{m.label}</span><span className="score-pct">{m.score}%</span></div>
                            <div className="bar"><i style={{ ['--w' as string]: `${m.score}%`, ['--r' as string]: j } as React.CSSProperties} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                  return (
                    <div key={i} className="feature-card" style={{ ['--i' as string]: i } as React.CSSProperties}>
                      {r.label && <span className="feature-step">{r.label}</span>}
                      {r.title && <h3>{r.title}</h3>}
                      {r.body && <p className="muted">{r.body}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      }
      // image + no rows → two-column split (copy left, image right; reverse flips it)
      if (img && !(block.rows?.length)) {
        // Our Story founder section: show Dr. Tommy Shavers' NESTRE Mindset Profile
        // ring in place of his photo.
        const founderProfile = /different view/i.test(block.heading || '')
        return (
          <section className={`sec ${block.theme || 'paper'}`}>
            <div className={`wrap split${block.reverse ? ' reverse' : ''}`}>
              <div className="split-copy">
                {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
                {block.heading && <h2 className="h2" style={{ marginTop: 14, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
                {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
                <Buttons ctas={block.ctas} />
              </div>
              <div className="split-media">
                {founderProfile ? (
                  <MindsetRingCard values={FOUNDER_PROFILE} />
                ) : (
                  <div className="thumb-lg"><Visual url={img} alt={mediaAlt(block.image)} /></div>
                )}
              </div>
            </div>
          </section>
        )
      }
      return (
        <section className={`sec ${block.theme || 'paper'}`}>
          <div className="wrap">
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && <h2 className="h2" style={{ marginTop: 16, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.body && <p className="lead muted" style={{ whiteSpace: 'pre-line' }}>{block.body}</p>}
            {img && <div className="thumb-lg" style={{ maxWidth: 760, marginTop: 28 }}><img src={img} alt={mediaAlt(block.image)} /></div>}
            <div className="rows">
              {block.rows?.map((r: any, i: number) => (
                <div key={i} className="row-item">
                  {r.label && <div className="kick">{r.label}</div>}
                  {r.title && <h3>{r.title}</h3>}
                  {r.body && <p className="muted" style={{ marginTop: 6 }}>{r.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )
    }
    case 'callout':
      return (
        <section className="sec callout-sec">
          <div className="callout-block">
            <div className="wrap">
              {block.label && <p className="callout-kicker">{block.label}</p>}
              <p className="callout-copy">
                {block.heading && <span className="callout-lead">{block.heading} </span>}
                {block.body}
              </p>
            </div>
          </div>
        </section>
      )
    case 'faq':
      return (
        <section className={`sec ${block.theme || 'paper'}`}>
          <div className="wrap" style={{ maxWidth: 820 }}>
            {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
            {block.heading && <h2 className="h2" style={{ marginTop: 16, marginBottom: 24, whiteSpace: 'pre-line' }}>{block.heading}</h2>}
            {block.items?.map((it: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <details key={i} className="faq-item">
                <summary>{it.q}</summary>
                <p className="muted">{it.a}</p>
              </details>
            ))}
          </div>
        </section>
      )
    case 'locations':
      return <LocationsMap eyebrow={block.eyebrow} heading={block.heading} body={block.body} />
    case 'richText':
      return (
        <section className={`sec ${block.theme || 'paper'}`}>
          <div className="wrap"><p className="lead muted">Rich text block</p></div>
        </section>
      )
    default:
      return null
  }
}

export function RenderBlocks({ blocks, afterHero }: { blocks: any[]; afterHero?: React.ReactNode }) {
  if (!blocks?.length) return null
  // data-block-idx tags each section so the AI Studio overlay can target it.
  // display:contents keeps the wrapper out of layout — blocks render unchanged.
  return (
    <>
      {blocks.map((b, i) => (
        <React.Fragment key={b.id || i}>
          <div data-block-idx={i} data-block-type={b.blockType} style={{ display: 'contents' }}>
            <Block block={b} />
          </div>
          {i === 0 && <div id="next" className="scroll-anchor" aria-hidden />}
          {i === 0 && afterHero}
        </React.Fragment>
      ))}
    </>
  )
}
