import React from 'react'
import { Reveal } from './Reveal'
import { Tracking } from './Tracking'

// Location scheduling page, rebuilt from the legacy WordPress pages on the NESTRE
// design system — same section order, content and Acuity booking (owner 23912005),
// kept at the original URLs so ads + scheduling keep working.
const OWNER = '23912005'
const PHONE_DISPLAY = '(689) 710-3260'
const PHONE_HREF = 'tel:+16897103260'
const cart = (id: string) => `https://app.acuityscheduling.com/catalog.php?owner=${OWNER}&action=addCart&clear=1&id=${id}`

const PACKAGE_COPY: Record<string, string> = {
  'Better with Age': 'At NESTRE we strive to make getting older a part of getting better. If you want to age well then it’s time to add mental and cognitive activity to your physical activity. Better With Age training is designed for our aging performers to help strengthen mental and cognitive performance while building resiliency to help you experience aging the way it should be — better.',
  'Copy That!': 'Having the ability to take in information that allows you to both “see it and do it” at a high level is a modern-day superpower. Copy That training focuses on tapping into our ability to mirror what we see and observe, turning those mental models into cognitive downloads that we store as our own personal copies.',
  'Head in the Game': 'If you’re finding it difficult to stay locked into the present moment, silencing the noise around you, or eliminating overthinking and analysis paralysis — it’s time to get your Head In the Game. This training shifts you from overly internal to optimally external, so you stay engaged with the task at hand and keep moving forward in a positive, productive way.',
  'PIT Stop': 'For high-stakes performers (first responders, essential workers, race car drivers, pilots) where every second and every decision can have life-impacting implications. PIT (Performance Intelligence Training) Stops strengthen your wellness resiliency and access to performance potential in real-time, when it matters most — helping you be ready and stay ready for your better.',
  'Re-Charge': 'If you are an executive, key decision maker, or leader who constantly has to be at the top of your game mentally and cognitively — then it’s time for a Re-Charge. Executive Re-Charge training works to put you back in your performance element, ready to attack the moment at a high level.',
  'Think Fast': 'There are times when time is not a luxury for decision-making and taking action. The only thing better than making the right decision is making the right decision faster. Think Fast training makes you more efficient at processing the relevant information to make quicker, more decisive decisions in real-time.',
  'Decision Maker': 'Designed for those who want to take confident action toward their goals. It strengthens your ability to make quick, effective decisions on the fly while maintaining control in any situation. Sharpen your decisiveness and master your response under pressure.',
  'Laser Focused': 'Designed for those who want to sustain attention and stay locked in over extended periods. It trains your ability to quickly recognize what’s important and efficiently switch focus when needed — strengthening your mental clarity and precision to perform at your best, without distraction.',
  'Memory Muscle': 'Designed for those who want to recall memories more vividly and retain information longer. Whether it’s learned skills, important knowledge, or new experiences, this program strengthens your brain’s ability to store and retrieve what matters most.',
  'Movement Master': 'Designed for those looking to enhance both large and precise physical movements. It helps improve balance, coordination, and stability, keeping you steady on your feet in any situation — elevating your control, agility, and overall movement performance.',
  'Quiet in the Storm': 'Designed to train your mind to stay calm and centered under pressure. It strengthens your emotional stability and enhances your ability to process stressful situations effectively — helping you navigate challenges with clarity and ease, keeping your mind steady when it matters most.',
}

export type ScheduleConfig = {
  location: string
  address?: string
  consultationId: string
  jumpstartId: string
  // `packages` = the named Everyday Performer programs (grouped Advanced/Base by name
  // below). `programs` = the Signature session-bundle packages (with a duration sub).
  packages: { name: string; id: string }[]
  programs: { name: string; sub: string; id: string; tier: 'Advanced' | 'Base' }[]
  videos: { consultation?: string; whatToExpect?: string; everydayPerformer?: string; signature?: string; signup?: string }
  hours: string
  zoom?: string
  consultPrice: string
}

// The Advanced/Base split of the Everyday Performer named programs is the same at
// every location (only the Acuity ids differ), so it lives here, not in each config.
// Re-Charge is in the Acuity catalog but not shown in the WP Everyday Performer grid.
const EVERYDAY_TIERS: Record<'Advanced' | 'Base', string[]> = {
  Advanced: ['Better with Age', 'Copy That!', 'Head in the Game', 'PIT Stop', 'Think Fast'],
  Base: ['Decision Maker', 'Laser Focused', 'Memory Muscle', 'Movement Master', 'Quiet in the Storm'],
}

function Vid({ src, label, portrait }: { src: string; label?: string; portrait?: boolean }) {
  return (
    <figure className={`sched-video thumb-lg${portrait ? ' portrait' : ''}`}>
      <video src={src} controls playsInline preload="metadata" aria-label={label} />
    </figure>
  )
}

export function SchedulePageBody({ cfg }: { cfg: ScheduleConfig }) {
  const faq = [
    { q: 'How do I reschedule my appointment?', a: 'Use the “Change/Cancel Appointment” link in your confirmation email. Choose a new date and time from the available options.' },
    { q: 'How do I cancel my appointment?', a: 'You can cancel by clicking the “Change/Cancel Appointment” link found in your confirmation email. This takes you directly to the cancellation page.' },
    { q: 'I can’t find my confirmation email. What should I do?', a: 'Check your spam or promotions folder. If you still can’t locate it, contact us and we can resend it.' },
    { q: 'What hours is the NESTRE Scheduler available for assistance?', a: `Monday–Friday, ${cfg.hours}.` },
  ]
  const v = cfg.videos

  return (
    <main id="main">
      <Tracking />
      {/* Consultation */}
      <section className="sec navy" id="consultation">
        <div className="wrap">
          <p className="eyebrow">Schedule with NESTRE · {cfg.location}</p>
          <h1 className="h2" style={{ marginTop: 16, maxWidth: '20ch' }}>Your NESTRE training starts with a consultation.</h1>
          {cfg.address && <p className="lead" style={{ color: 'rgba(255,255,255,.7)', marginTop: 12 }}>{cfg.address}</p>}
          <p className="lead" style={{ color: 'rgba(255,255,255,.82)', marginTop: 16, maxWidth: '60ch' }}>
            A NESTRE Consultation is the required, baseline assessment needed before you can take the
            next step in training the brain. NESTRE Brain Training is the ongoing cognitive and mental
            strength program you follow after your consultation for lasting mind &amp; brain fitness.
          </p>
          {v.consultation && <Vid src={v.consultation} label="How to schedule a consultation" portrait />}
          <div className="btns" style={{ marginTop: 22 }}>
            <a className="btn aqua" href={cart(cfg.consultationId)} target="_blank" rel="noopener noreferrer">Schedule consultation</a>
          </div>
          <div className="sched-contact">
            <p><strong>Contact scheduler</strong></p>
            <p>Call the NESTRE Scheduler at <a href={PHONE_HREF}>{PHONE_DISPLAY}</a></p>
            <p className="muted" style={{ color: 'rgba(255,255,255,.6)' }}>Between the hours of {cfg.hours}</p>
            {cfg.zoom && (
              <p style={{ marginTop: 10 }}>
                Prefer video? <a href={cfg.zoom} target="_blank" rel="noopener noreferrer">Start a Zoom call with the scheduler</a> — choose “Join from Browser.”
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Summer promo strip — sits below the consultation hero (matches WP order) */}
      <section className="sec paper sched-promo-strip">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow" style={{ color: 'var(--aqua-ink)' }}>Summer Promo</p>
          <h2 className="h2" style={{ marginTop: 8 }}>$250 off our Jumpstart Training.</h2>
          <div className="btns" style={{ justifyContent: 'center', marginTop: 18 }}>
            <a className="btn aqua" href="#jumpstart">Learn more</a>
          </div>
        </div>
      </section>

      {/* What to expect during your consultation */}
      {v.whatToExpect && (
        <section className="sec paper">
          <div className="wrap">
            <p className="eyebrow">A look inside</p>
            <h2 className="h2" style={{ marginTop: 14 }}>What to expect during your consultation.</h2>
            <Vid src={v.whatToExpect} label="What to expect during your consultation" />
          </div>
        </section>
      )}

      {/* Jumpstart promo */}
      <section className="sec paper" id="jumpstart">
        <div className="wrap">
          <div className="promo-card">
            <p className="eyebrow" style={{ color: 'var(--aqua-ink)' }}>Summer 2026 · Jumpstart</p>
            <h2 className="h2" style={{ marginTop: 12 }}>$250 OFF our Jumpstart Training.</h2>
            <p className="lead muted" style={{ marginTop: 12 }}>Use code <strong>JUMPSTART</strong> at checkout. <em>Consultation not included.</em></p>
            <p className="muted" style={{ marginTop: 8, fontWeight: 600, color: 'var(--ink)' }}>What you get:</p>
            <ul className="promo-list">
              <li>5 days of consistent mind &amp; brain training</li>
              <li>5 one-on-one training sessions</li>
              <li>A training plan built for your mind &amp; brain fitness goals</li>
            </ul>
            <div className="btns" style={{ marginTop: 20 }}>
              <a className="btn ink" href={cart(cfg.consultationId)} target="_blank" rel="noopener noreferrer">Purchase consultation</a>
              <a className="btn aqua" href={cart(cfg.jumpstartId)} target="_blank" rel="noopener noreferrer">Purchase Jumpstart</a>
            </div>
            <p className="promo-fine">
              A NESTRE Consultation and the Jumpstart Package are two different experiences. Offer valid
              through August 31, 2026, and may be used any number of times during the promotional period.
              If more than two months have passed since your last NESTRE™ training session, completion of
              a NESTRE™ Consultation ({cfg.consultPrice}) is required before redeeming. NESTRE™ reserves the
              right to modify or discontinue this promotion at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Everyday Performer packages — the named programs, grouped Advanced / Base */}
      <section className="sec paper" id="everyday-performer">
        <div className="wrap">
          <p className="eyebrow">Everyday Performer</p>
          <h2 className="h2" style={{ marginTop: 14 }}>Everyday Performer packages.</h2>
          <p className="sched-required">** A consultation is required before scheduling an Everyday Performer package. **</p>
          {v.everydayPerformer && <Vid src={v.everydayPerformer} label="How to schedule an Everyday Performer package" />}
          {(['Advanced', 'Base'] as const).map((tier) => {
            const rows = EVERYDAY_TIERS[tier]
              .map((name) => cfg.packages.find((p) => p.name === name))
              .filter(Boolean) as { name: string; id: string }[]
            if (!rows.length) return null
            return (
              <div key={tier} style={{ marginTop: 28 }}>
                <h3 className="kick" style={{ marginBottom: 14 }}>{tier} training packages</h3>
                <div className="pkg-grid">
                  {rows.map((p) => (
                    <div key={p.name} className="pkg-card">
                      <h3>{p.name}</h3>
                      <p className="muted">{PACKAGE_COPY[p.name]}</p>
                      <a className="btn outline" href={cart(p.id)} target="_blank" rel="noopener noreferrer">Purchase package</a>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Signature packages — the session-bundle programs */}
      <section className="sec paper" id="signature-packages">
        <div className="wrap">
          <p className="eyebrow">Signature</p>
          <h2 className="h2" style={{ marginTop: 14 }}>Signature packages.</h2>
          <p className="sched-required">** A consultation is required before scheduling a Signature Package. **</p>
          {v.signature && <Vid src={v.signature} label="How to schedule a Signature package" />}
          <div className="pkg-grid" style={{ marginTop: 28 }}>
            {cfg.programs.map((p) => (
              <div key={p.name} className="pkg-card">
                <h3>{p.name}</h3>
                <p className="muted">{p.sub}</p>
                <a className="btn outline" href={cart(p.id)} target="_blank" rel="noopener noreferrer">Purchase program</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign up on the NESTRE App */}
      {v.signup && (
        <section className="sec navy">
          <div className="wrap">
            <p className="eyebrow">Getting started</p>
            <h2 className="h2" style={{ marginTop: 14, color: '#fff' }}>How to sign up on the NESTRE App.</h2>
            <Vid src={v.signup} label="How to sign up on the NESTRE App" portrait />
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="sec paper">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">FAQ</p>
          <h2 className="h2" style={{ marginTop: 16, marginBottom: 24 }}>Before you book.</h2>
          {faq.map((it, i) => (
            <details key={i} className="faq-item">
              <summary>{it.q}</summary>
              <p className="muted">{it.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing contact */}
      <section className="sec navy">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ color: '#fff', maxWidth: '20ch', marginInline: 'auto' }}>Questions before you book?</h2>
          <p className="lead" style={{ color: 'rgba(255,255,255,.78)', marginTop: 14, marginInline: 'auto', maxWidth: 'none' }}>
            Call the NESTRE Scheduler at <a href={PHONE_HREF} style={{ color: 'var(--aqua)' }}>{PHONE_DISPLAY}</a> · {cfg.hours}
          </p>
          <div className="btns" style={{ justifyContent: 'center', marginTop: 22 }}>
            <a className="btn aqua" href={cart(cfg.consultationId)} target="_blank" rel="noopener noreferrer">Schedule consultation</a>
          </div>
        </div>
      </section>
      <Reveal />
    </main>
  )
}
