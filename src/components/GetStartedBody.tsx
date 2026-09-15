import React from 'react'
import { Reveal } from './Reveal'

// Ad landing page ("Get Started at …") rebuilt from the legacy WordPress pages on
// the NESTRE design system. Same content + the same Acuity booking links, kept at
// the original URLs so Meta/Google ads keep landing. `acuityType` is the Acuity
// appointmentType for this location's direct consultation booking.
const OWNER = '23912005'
const PHONE_DISPLAY = '(689) 710-3260'
const PHONE_HREF = 'tel:+16897103260'

const LOGOS = [
  { src: '/legacy/logos/grey-bloomberg.png', alt: 'Bloomberg' },
  { src: '/legacy/logos/grey-sports-illustrated.png', alt: 'Sports Illustrated' },
  { src: '/legacy/logos/grey-espn.png', alt: 'ESPN' },
  { src: '/legacy/logos/grey-havard-medical-school.png', alt: 'Harvard Medical School' },
  { src: '/legacy/logos/grey-bleacher-report.png', alt: 'Bleacher Report' },
]

export function GetStartedBody({ location, acuityType }: { location: string; acuityType: string }) {
  const schedule = `https://app.acuityscheduling.com/schedule.php?owner=${OWNER}&appointmentType=${acuityType}`

  return (
    <main id="main">
      {/* Hero — headline, price, primary booking CTAs */}
      <section className="sec navy get-hero">
        <div className="wrap">
          <p className="eyebrow">Your Initial Consultation · {location}</p>
          <h1 className="h2" style={{ marginTop: 16, maxWidth: '18ch' }}>
            Schedule your consultation today to understand how you process the world.
          </h1>
          <p className="lead" style={{ color: 'rgba(255,255,255,.8)', marginTop: 18, maxWidth: '58ch' }}>
            During your 60-minute NESTRE Consultation, you&rsquo;ll complete a 3-minute brain scan
            recording and the NESTRE Mindset Profile, then review your results one-on-one with a
            Neuro-Strength Trainer. Leave with a personalized report, a clearer understanding of your
            cognitive patterns, and recommendations for what to do next.
          </p>
          <div className="get-price">
            <span className="get-price-now">$250</span>
            <span className="get-price-was">Regularly $300</span>
          </div>
          <div className="btns">
            <a className="btn aqua" href={schedule} target="_blank" rel="noopener noreferrer">Schedule my consultation</a>
            <a className="btn outline light" href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
          </div>
          <p className="muted" style={{ color: 'rgba(255,255,255,.6)', marginTop: 14, fontSize: 14 }}>
            Prefer to speak with someone? Call the number above.
          </p>
          <ul className="get-features">
            <li>One-on-One at {location}</li>
            <li>60 Minutes</li>
            <li>Personalized results review</li>
            <li>Post-Consultation report</li>
          </ul>
        </div>
      </section>

      {/* Social proof */}
      <section className="sec paper">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ maxWidth: '20ch', marginInline: 'auto' }}>
            Trusted by high performers. Built for anyone. Ready for more.
          </h2>
          <p className="lead muted" style={{ maxWidth: '62ch', marginInline: 'auto', marginTop: 16 }}>
            NESTRE has supported executives, professional athletes, organizations, sports teams, and
            individuals seeking to better understand and strengthen their mental and cognitive performance.
          </p>
          <div className="get-logos">
            {LOGOS.map((l) => (
              <img key={l.alt} src={l.src} alt={l.alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* From NEURO to Strength */}
      <section className="sec paper">
        <div className="wrap">
          <p className="eyebrow">What to expect · The NESTRE Experience</p>
          <h2 className="h2" style={{ marginTop: 16 }}>From NEURO to Strength.</h2>
          <p className="lead muted" style={{ maxWidth: '58ch', marginTop: 14 }}>
            NESTRE makes cognitive performance understandable — measuring what matters and training
            for what comes next.
          </p>
          <div className="get-two">
            <div className="get-col">
              <span className="kick">Step 1 · Understanding</span>
              <h3>NEURO</h3>
              <p className="get-col-lead">NEURO helps you understand where you are.</p>
              <p className="muted">
                Your one-on-one consultation gives you a better understanding of how your mind and
                brain process and respond to the world around you.
              </p>
            </div>
            <div className="get-col">
              <span className="kick">Step 2 · Training</span>
              <h3>STRENGTH</h3>
              <p className="get-col-lead">STRENGTH helps you train what matters.</p>
              <p className="muted">
                Your Neuro-Strength Trainer creates a personalized training program built to support
                your cognitive goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What happens during your consultation */}
      <section className="sec navy">
        <div className="wrap">
          <p className="eyebrow">Step 1 · NEURO</p>
          <h2 className="h2" style={{ marginTop: 16, color: '#fff' }}>What happens during your consultation.</h2>
          <p className="lead" style={{ color: 'rgba(255,255,255,.78)', marginTop: 14, maxWidth: '52ch' }}>
            Your consultation is a personalized, one-on-one experience built around you — your goals,
            your 3-minute NESTRE Brain Scan, and your NESTRE Mindset Profile.
          </p>
          <div className="steps">
            {[
              { n: '01', t: 'Complete your 3-minute brain scan', b: 'Your NESTRE Brain Scan establishes a baseline for how your brain is performing today — a personalized starting point for identifying strengths, patterns, and opportunities for training.' },
              { n: '02', t: 'Complete your NESTRE Mindset Profile', b: 'Your NESTRE Mindset Profile helps your trainer better understand how your mind and brain process and respond to the world around you.' },
              { n: '03', t: 'Review your results one-on-one', b: 'Your Neuro-Strength Trainer brings the information together, explains your results, answers your questions, and identifies personalized opportunities for training.' },
            ].map((s, i) => (
              <div key={i} className="step" style={{ ['--i' as string]: i } as React.CSSProperties}>
                <span className="kick">{s.n}</span>
                <h3>{s.t}</h3>
                <p className="muted" style={{ marginTop: 8, color: 'rgba(255,255,255,.7)' }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec paper">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">FAQ</p>
          <h2 className="h2" style={{ marginTop: 16, marginBottom: 24 }}>Before you book.</h2>
          {[
            { q: 'What is a NESTRE Consultation?', a: 'A NESTRE Consultation is a personalized experience designed to help you better understand how your brain processes the world around you. You’ll review your individual data, cognitive strengths, potential training opportunities for better cognitive performance, and recommended next steps to maintain your cognitive fitness through our NESTRE training programs.' },
            { q: 'What is Neuro-Strength Training?', a: 'We strengthen your mind and brain to perform at its highest level through consistent cognitive fitness training based on the data we collect during your consultation. Neuro-Strength Training is NESTRE’s personalized approach to strengthening mental and cognitive performance, informed by neuroplasticity — the brain’s ability to learn, adapt, and grow.' },
            { q: 'How much does the initial consultation cost?', a: 'The regular price is $300. For a limited time, new clients can schedule an initial consultation for $250 — a savings of $50.' },
            { q: 'What is NESTRE?', a: 'NESTRE is a neuro-strength company that specializes in neck-up fitness. We help individuals train their brains the same way they train their bodies — combining the science of neuroplasticity, cognitive performance data, personalized training, and technology to help people get better, feel better, and perform better from the neck up.' },
            { q: 'Does NESTRE take insurance?', a: 'No, we don’t currently take insurance.' },
          ].map((it, i) => (
            <details key={i} className="faq-item">
              <summary>{it.q}</summary>
              <p className="muted">{it.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="sec paper">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ maxWidth: '18ch', marginInline: 'auto' }}>Ready to understand how you process the world?</h2>
          <div className="btns" style={{ justifyContent: 'center', marginTop: 24 }}>
            <a className="btn aqua" href={schedule} target="_blank" rel="noopener noreferrer">Schedule my consultation</a>
            <a className="btn outline" href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>
      <Reveal />
    </main>
  )
}
