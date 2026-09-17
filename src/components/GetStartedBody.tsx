import React from 'react'
import { Reveal } from './Reveal'
import { GetStartedForm } from './GetStartedForm'
import { GtmTag } from './Tracking'

// Ad landing page ("Get Started at …") rebuilt faithfully from the legacy WordPress
// pages on the NESTRE design system — same sections, copy, images, icons and the
// same Acuity booking, kept at the original URLs so Meta/Google ads keep landing.
// `acuityType` is the Acuity appointmentType for this location's direct booking.
const OWNER = '23912005'
const PHONE_DISPLAY = '(689) 710-3260'
const PHONE_HREF = 'tel:+16897103260'
const IMG = '/legacy/getstarted'

// Our colour partner/press logo strip (same asset as the home page).
const LOGO_STRIP = '/legacy/logos/logos-color.png'
const LOGO_ALT = 'Featured by Bleacher Report, Harvard Medical School, Bloomberg, Sports Illustrated, the U.S. Department of Veterans Affairs, and ESPN'

// Maps the route's location label to the form's Preferred-Location option.
const PREFERRED: Record<string, string> = {
  'Neurovations': 'Winter Park, FL',
  'Lake Nona Performance Club': 'Lake Nona, FL',
}

export function GetStartedBody({ location, acuityType }: { location: string; acuityType: string }) {
  const schedule = `https://app.acuityscheduling.com/schedule.php?owner=${OWNER}&appointmentType=${acuityType}`

  const heroFeatures = [
    { icon: 'Exclude.png', t: `One-on-One at ${location}` },
    { icon: 'Clock.png', t: '60 Minutes' },
    { icon: 'profile.png', t: 'Personalized Results Review' },
    { icon: 'document-text.png', t: 'Post-Consultation Report' },
  ]

  const brings = [
    { icon: 'landing-page-personal-goals-icon.png', t: 'Your Personal Goals' },
    { icon: 'landing-page-brain-scan-icon.png', t: 'Your 3-minute NESTRE Brain Scan' },
    { icon: 'landing-page-mindset-profile-icon.png', t: 'Your NESTRE Mindset Profile' },
  ]

  const happens = [
    { n: '1', icon: 'landing-page-what-happens-1-icon.png', t: 'Complete Your 3-Minute Brain Scan', b: 'Your NESTRE Brain Scan establishes a baseline for how your brain is performing today. This gives your Neuro-Strength Trainer a personalized starting point for identifying strengths, patterns, and opportunities for training.' },
    { n: '2', icon: 'landing-page-what-happens-2-icon.png', t: 'Complete Your NESTRE Mindset Profile', b: 'Your NESTRE Mindset Profile helps your trainer better understand how your mind and brain process and respond to the world around you.' },
    { n: '3', icon: 'landing-page-what-happens-3-icon.png', t: 'Review Your Results One-on-One', b: 'Your Neuro-Strength Trainer brings the information together, explains your results, answers your questions, and identifies personalized opportunities for training.' },
    { n: '4', icon: 'landing-page-what-happens-4-icon-1.png', t: 'Receive Your Custom Training Report', b: 'You’ll leave with a custom training progress report and personalized recommendations for what to train next.' },
  ]

  const trains = [
    { icon: 'landing-page-personal-goals-icon.png', t: 'Focus and sustain attention' },
    { icon: 'landing-page-brain-scan-icon.png', t: 'Process information' },
    { icon: 'landing-page-mindset-profile-icon.png', t: 'Respond to high pressure and changing demands' },
    { icon: 'landing-page-strength-icon.png', t: 'Regulate your reactions' },
    { icon: 'landing-page-access-icon.png', t: 'Access clarity and capability when it matters most' },
  ]

  const whyBook = [
    { icon: 'stop-watch.png', t: '60 minutes, one-on-one with a Neuro-Strength Trainer' },
    { icon: 'Exclude.png', t: 'Personalized one-on-one training' },
    { icon: 'document-text.png', t: 'Customized reports for your review' },
  ]

  return (
    <main id="main">
      <GtmTag />
      {/* Hero */}
      <section className="sec navy get-hero">
        <div className="wrap">
          <p className="eyebrow">Your Initial Consultation · {location}</p>
          <h1 className="h2" style={{ marginTop: 16, maxWidth: '18ch' }}>Understand How Your Mind and Brain Perform.</h1>
          <p className="lead" style={{ color: 'rgba(255,255,255,.82)', marginTop: 18, maxWidth: '58ch' }}>
            During your 60-minute NESTRE Consultation, you’ll complete a 3-minute brain scan recording
            and the NESTRE Mindset Profile, then review your results one-on-one with a Neuro-Strength Trainer.
          </p>
          <p className="lead" style={{ color: 'rgba(255,255,255,.7)', marginTop: 12, maxWidth: '58ch' }}>
            Leave with a personalized report, a clearer understanding of your cognitive patterns, and
            recommendations for what to do next.
          </p>
          <div className="get-price">
            <span className="get-price-now">$250</span>
            <span className="get-price-was">Regularly $300</span>
          </div>
          <div className="btns">
            <a className="btn aqua" href="#book">Schedule my consultation</a>
            <a className="btn outline light" href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
          </div>
          <p className="muted" style={{ color: 'rgba(255,255,255,.6)', marginTop: 14, fontSize: 14 }}>
            Prefer to speak with someone? Call the number above.
          </p>
          <ul className="get-features">
            {heroFeatures.map((f) => (
              <li key={f.t}><img src={`${IMG}/${f.icon}`} alt="" aria-hidden />{f.t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Social proof */}
      <section className="sec paper">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
            Trusted by High Performers. Built for Anyone. Ready for More.
          </h2>
          <p className="lead muted" style={{ maxWidth: '62ch', marginInline: 'auto', marginTop: 16 }}>
            NESTRE has supported executives, professional athletes, organizations, sports teams, and
            individuals seeking to better understand and strengthen their mental and cognitive performance.
          </p>
          <div className="get-logos">
            <img src={LOGO_STRIP} alt={LOGO_ALT} loading="lazy" />
          </div>
        </div>
      </section>

      {/* From NEURO to Strength — two image cards */}
      <section className="sec navy">
        <div className="wrap">
          <p className="eyebrow">What to expect · The NESTRE Experience</p>
          <h2 className="h2" style={{ marginTop: 16, color: '#fff' }}>From NEURO to Strength.</h2>
          <p className="lead" style={{ color: 'rgba(255,255,255,.75)', maxWidth: '58ch', marginTop: 14 }}>
            NESTRE makes cognitive performance understandable — measuring what matters and training for
            what comes next.
          </p>
          <div className="get-ns">
            <article className="get-ns-card">
              <div className="get-ns-media"><img src={`${IMG}/landing-page-neuro-background.png`} alt="A NESTRE client during a cognitive performance data scan" loading="lazy" /></div>
              <div className="get-ns-body">
                <span className="kick">Step 1 · Understanding</span>
                <h3><img src={`${IMG}/landing-page-neuro-icon.png`} alt="" aria-hidden />NEURO</h3>
                <p className="get-col-lead">NEURO helps you understand where you are.</p>
                <p className="muted">Your one-on-one consultation gives you a better understanding of how your mind and brain process and respond to the world around you.</p>
              </div>
            </article>
            <article className="get-ns-card">
              <div className="get-ns-media"><img src={`${IMG}/landing-page-strength-background-01.png`} alt="A NESTRE Neuro-Strength Training session" loading="lazy" /></div>
              <div className="get-ns-body">
                <span className="kick">Step 2 · Training</span>
                <h3><img src={`${IMG}/landing-page-strength-icon.png`} alt="" aria-hidden />STRENGTH</h3>
                <p className="get-col-lead">STRENGTH helps you train what matters.</p>
                <p className="muted">Your Neuro-Strength Trainer creates a personalized training program built to support your cognitive goals.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Step 1 | NEURO — consultation, split image + checklist */}
      <section className="sec paper">
        <div className="wrap get-split">
          <div className="get-split-media natural"><img src={`${IMG}/landing-page-strength-background-03.webp`} alt="A NESTRE Neuro-Strength Trainer reviewing results with a client" loading="lazy" /></div>
          <div className="get-split-copy">
            <span className="kick">Step 1 · NEURO</span>
            <h2 className="h2" style={{ marginTop: 12 }}>Schedule Your Consultation Today to Understand How You Process the World.</h2>
            <p className="lead muted" style={{ marginTop: 14 }}>Your consultation is a personalized, one-on-one experience built around you.</p>
            <p className="muted" style={{ marginTop: 18, fontWeight: 600, color: 'var(--ink)' }}>Your Neuro-Strength Trainer brings together:</p>
            <ul className="get-checklist">
              {brings.map((b) => (
                <li key={b.t}><img src={`${IMG}/${b.icon}`} alt="" aria-hidden /><span>{b.t}</span></li>
              ))}
            </ul>
            <p className="muted" style={{ marginTop: 18 }}>Your Neuro-Strength Trainer then helps you understand your cognitive strengths, performance patterns, and the areas where you may have the greatest opportunity to build cognitive capacity.</p>
            <p className="muted" style={{ marginTop: 12 }}>You’ll leave with a custom training progress report and personalized recommendations for what to train next.</p>
          </div>
        </div>
      </section>

      {/* What happens during your consultation — 4 cards */}
      <section className="sec navy">
        <div className="wrap">
          <h2 className="h2" style={{ color: '#fff', maxWidth: '20ch' }}>What Happens During Your Consultation:</h2>
          <div className="get-cards">
            {happens.map((s) => (
              <div key={s.n} className="get-card" style={{ ['--i' as string]: Number(s.n) - 1 } as React.CSSProperties}>
                <div className="get-card-top"><span className="get-card-n">{s.n}</span><img src={`${IMG}/${s.icon}`} alt="" aria-hidden /></div>
                <h3>{s.t}</h3>
                <p className="muted">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2 | Strength — Train What Matters, split image + checklist */}
      <section className="sec paper">
        <div className="wrap get-split reverse">
          <div className="get-split-media"><img src={`${IMG}/landing-page-strength-background-04.webp`} alt="A NESTRE client in a Neuro-Strength Training session" loading="lazy" /></div>
          <div className="get-split-copy">
            <span className="kick">Step 2 · STRENGTH</span>
            <h2 className="h2" style={{ marginTop: 12 }}>Train What Matters.</h2>
            <p className="muted" style={{ marginTop: 14 }}>Your consultation gives you understanding, direction, and a personalized starting point. When you choose to begin training, your Neuro-Strength Trainer uses the priorities identified during your consultation to shape a custom Neuro-Strength Training plan personalized to you.</p>
            <p className="muted" style={{ marginTop: 12 }}>Your later training sessions are informed by your goals, your unique cognitive patterns, and what your trainer learned about you during the NEURO stage.</p>
            <p className="muted" style={{ marginTop: 18, fontWeight: 600, color: 'var(--ink)' }}>Through personalized, guided Neuro-Strength Training, you can begin training cognitive patterns that support how you:</p>
            <ul className="get-checklist two">
              {trains.map((t) => (
                <li key={t.t}><img src={`${IMG}/${t.icon}`} alt="" aria-hidden /><span>{t.t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pill callouts */}
      <section className="sec paper" style={{ paddingTop: 0 }}>
        <div className="wrap get-pills">
          <div className="get-pill"><strong>NEURO</strong> helps you understand where you are.</div>
          <div className="get-pill"><strong>STRENGTH</strong> helps you train what matters.</div>
        </div>
      </section>

      {/* Closing statement + offer */}
      <section className="sec navy">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ color: '#fff', maxWidth: '22ch', marginInline: 'auto' }}>Understand where you are. Train your cognitive performance. Be Ready for More.</h2>
          <div className="get-offer">
            <p className="eyebrow" style={{ color: 'var(--aqua)' }}>Discover What Your Mind and Brain Data Can Tell You</p>
            <p className="muted" style={{ color: 'rgba(255,255,255,.72)', marginTop: 10 }}>Save $50 on your NESTRE consultation</p>
            <div className="get-offer-price"><span className="was">Regular $300</span><span className="now">Now $250</span></div>
            <div className="btns" style={{ justifyContent: 'center', marginTop: 20 }}>
              <a className="btn aqua" href="#book">Schedule my consultation</a>
              <a className="btn outline light" href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section className="sec paper" id="book">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow" style={{ color: 'var(--aqua-ink)' }}>Limited-Time Offer</p>
          <h2 className="h2" style={{ marginTop: 10 }}>Claim Your $50 Consultation Savings.</h2>
          <p className="lead muted" style={{ marginInline: 'auto', marginTop: 12 }}>Schedule your initial NESTRE Consultation for $250 — regularly $300.</p>
        </div>
        <div className="wrap get-book">
          <div className="get-book-form">
            <GetStartedForm defaultLocation={PREFERRED[location]} />
          </div>
          <aside className="get-book-side">
            <div className="get-book-media">
              <img src={`${IMG}/ladyprofile.png`} alt="A NESTRE client with her cognitive performance data profile" loading="lazy" />
              <div className="get-book-why">
                <p className="kick" style={{ color: 'var(--aqua)' }}>Why Clients Book</p>
                <ul>
                  {whyBook.map((w) => (
                    <li key={w.t}><img src={`${IMG}/${w.icon}`} alt="" aria-hidden /><span>{w.t}</span></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="get-book-call">
              <p>Prefer to speak to a NESTRE team member?</p>
              <a className="btn outline" href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
            </div>
          </aside>
        </div>
      </section>

      <Reveal />
    </main>
  )
}
