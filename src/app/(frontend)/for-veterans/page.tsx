import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import styles from './veterans.module.css'

const BOOK_HREF =
  'https://app.acuityscheduling.com/schedule.php?owner=23912005&appointmentType=100365539'

export const metadata: Metadata = {
  title: { absolute: 'NESTRE for Veterans | Thank You, Veterans' },
  description:
    'To every veteran who served, and to every human, your cognitive future is not fixed. There is more for you.',
  alternates: { canonical: `${SITE_URL}/for-veterans` },
  openGraph: {
    title: 'NESTRE for Veterans | Thank You, Veterans',
    description:
      'To every veteran who served, and to every human, your cognitive future is not fixed. There is more for you.',
    type: 'website',
    siteName: 'NESTRE',
    url: `${SITE_URL}/for-veterans`,
    images: [{ url: '/heroes/thank-you-veterans.png', width: 1600, height: 900, alt: 'American flag' }],
  },
}

function BookLink({ children }: { children: React.ReactNode }) {
  return (
    <a className={styles.pill} href={BOOK_HREF} target="_blank" rel="noopener">
      {children}
      <span aria-hidden="true">→</span>
    </a>
  )
}

export default function ForVeteransPage() {
  return (
    <main id="main" data-page="for-veterans" className={styles.page}>
      <section className="hero veterans" aria-labelledby="veterans-hero-title">
        <div className="bg">
          <img src="/heroes/thank-you-veterans.png" alt="" />
        </div>
        <div className="grad" />
        <div className="wrap inner">
          <p className="eyebrow">NESTRE for Veterans</p>
          <h1 id="veterans-hero-title">
            <span className="line">THANK YOU,</span>
            <span className="line">VETERANS.</span>
          </h1>
          <div className="veterans-copy">
            <p>
              To every veteran who served, and to every human, your cognitive future is not fixed.
              There is more for you. We&apos;re here to serve you, from the neck up, with the same
              commitment you&apos;ve shown us.
            </p>
          </div>
          <div className="btns">
            <BookLink>Book Your 50% Off Consultation</BookLink>
          </div>
        </div>
      </section>

      <section className={styles.offerHead} id="offer" aria-labelledby="offer-title">
        <div className={`wrap ${styles.center}`}>
          <p className={`${styles.kicker} ${styles.kickerTeal}`}>A thank you for your service</p>
          <h2 id="offer-title">
            RECEIVE 50% OFF YOUR
            <br className={styles.wideBreak} /> INITIAL CONSULTATION.
          </h2>
          <div className={styles.priceRow}>
            <p className={styles.price}>
              <span>Regularly $300</span>
              <span className={styles.sep} aria-hidden="true">
                |
              </span>
              <strong>Your Price: $150</strong>
            </p>
            <BookLink>Book Your Consultation</BookLink>
          </div>
        </div>
      </section>

      <section className={styles.offerBody} aria-labelledby="qualify-title">
        <div className="wrap">
          <div className={styles.offerStack}>
            <div className={styles.copy}>
              <p>
                NESTRE brings together objective cognitive performance data, personal interpretation
                and customized mind and brain training to support your mind and brain fitness goals.
              </p>
            </div>
            <div className={styles.qualify}>
              <h2 id="qualify-title" className={styles.sectionTitle}>
                TO QUALIFY:
              </h2>
              <ul className={styles.list}>
                <li>Must be a U.S. military veteran, active-duty service member, or reservist.</li>
                <li>Book online or by phone by Friday, November 13, 2026.</li>
                <li>Complete your consultation by November 30, 2026.</li>
              </ul>
              <p className={styles.note}>Bring a valid military or veteran ID to your consultation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.consult} id="consultation" aria-labelledby="consult-title">
        <div className="wrap">
          <div className={styles.consultGrid}>
            <img
              className={styles.photo}
              src="/veterans/consultation.jpg"
              width={2000}
              height={1333}
              alt="A man sits with eyes closed during a NESTRE cognitive performance scan, wearing a white sensor cap with blue electrodes."
            />
            <div>
              <p className={`${styles.kicker} ${styles.kickerExpect}`}>What to expect</p>
              <h2 id="consult-title">
                YOUR NESTRE INITIAL
                <br className={styles.wideBreak} /> CONSULTATION INCLUDES:
              </h2>
              <ul className={styles.list}>
                <li>3-minute cognitive performance data scan</li>
                <li>NESTRE Mindset Profile</li>
                <li>60-minute consultation with a NeuroTrainer</li>
                <li>Take-home report with personal insights and training recommendations</li>
              </ul>
            </div>
          </div>
          <p className={styles.quote}>
            “We’re here to serve you, from the neck up, with the same commitment you’ve shown us.”
          </p>
        </div>
      </section>

      <section className={styles.stories} id="stories" aria-labelledby="stories-title">
        <div className="wrap">
          <h2 id="stories-title">VOICES FROM VETERANS WE’VE TRAINED</h2>
          <div className={styles.cards}>
            <article className={styles.card}>
              <div className={styles.qmark} aria-hidden="true">
                “
              </div>
              <blockquote>
                After NESTRE I feel now that I’m much stronger, my cognitive abilities have
                blossomed, so to speak.
              </blockquote>
              <div className={styles.person}>
                Rick Comerford
                <div className={styles.role}>Special Forces Green Beret</div>
              </div>
            </article>
            <article className={styles.card}>
              <div className={styles.qmark} aria-hidden="true">
                “
              </div>
              <blockquote>
                I can remember phone numbers, I can remember people’s names. Before I used to
                heavily rely on faces… I don’t have to do that anymore.
              </blockquote>
              <div className={styles.person}>
                Martin Huddleston
                <div className={styles.role}>Army National Guard · E-3</div>
              </div>
            </article>
            <article className={styles.card}>
              <div className={styles.qmark} aria-hidden="true">
                “
              </div>
              <blockquote>
                Within the first 2 sessions about 40% of the brain fog went away. I’m actually
                remembering things that I did not know I had forgotten from my past.
              </blockquote>
              <div className={styles.person}>
                Billy Burkhart
                <div className={styles.role}>U.S. Army · Private First Class (PFC)</div>
              </div>
            </article>
          </div>
          <div className={styles.storiesCta}>
            <BookLink>Book Your 50% Off Consultation</BookLink>
          </div>
        </div>
      </section>

      <section className={styles.podcast} id="podcast" aria-labelledby="podcast-title">
        <div className="wrap">
          <div className={styles.podcastGrid}>
            <div>
              <p className={`${styles.kicker} ${styles.kickerLight}`}>The Better Mind Podcast</p>
              <h2 id="podcast-title">
                INSIDE THE MIND
                <br />
                OF A LEADER:
                <br />
                JOE BYERLY
              </h2>
              <div className={styles.video}>
                <iframe
                  src="https://www.youtube-nocookie.com/embed/OWOBvu-GVrA?rel=0"
                  title="The Better Mind Podcast — Inside the Mind of a Leader: Joe Byerly"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <a
                className={`${styles.pill} ${styles.watch}`}
                href="https://youtu.be/OWOBvu-GVrA"
                target="_blank"
                rel="noopener"
              >
                Watch the Conversation <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className={styles.joe}>
              <h3>JOE BYERLY</h3>
              <p>Retired U.S. Army Lieutenant Colonel</p>
              <ul className={styles.list}>
                <li>20 years of U.S. Army service</li>
                <li>Purple Heart recipient</li>
                <li>Multiple Bronze Star awards</li>
                <li>Multiple Legion of Merit awards</li>
                <li>General Douglas MacArthur Leadership Award</li>
                <li>Combat deployments in Iraq and Afghanistan</li>
                <li>Founder of From the Green Notebook</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing} id="contact" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title">READY TO CONNECT WITH NESTRE?</h2>
          <p>We’re here to support your next chapter.</p>
          <div className={styles.actions}>
            <a className={styles.pill} href="tel:+16897103260">
              Call to Book: 689-710-3260
            </a>
            <a className={styles.pill} href="mailto:Neurolabs@nestreperformance.com">
              Email Our Team <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <div className={styles.legalWrap}>
        <div className="wrap">
          <p className={styles.legal}>
            This offer provides 50% off a standard NESTRE cognitive performance consultation
            (regularly $300; your price $150) and is available exclusively to U.S. military
            veterans, active-duty service members, and reservists at both NESTRE locations. To
            qualify, individuals must book their consultation online or by phone by Friday,
            November 13, 2026, and complete their consultation no later than November 30, 2026.
            Valid military or veteran identification must be presented at the time of consultation
            to verify eligibility. This offer is limited to one discounted consultation per
            eligible individual and cannot be combined with other discounts or referral offers.
            Consultations, including rescheduled appointments, must be completed by November 30,
            2026, to qualify for the discounted rate. All appointments are subject to availability
            and NESTRE&apos;s standard cancellation and rescheduling policies.
          </p>
        </div>
      </div>
    </main>
  )
}
