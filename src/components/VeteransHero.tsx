import { ConsultFooterLink } from './ConsultFooterLink'

// Full-bleed Veterans Day hero. Copy is the approved lockup — do not rewrite.
// `scroll` keeps the homepage's existing Learn more → #next path.
// `consult` follows the site's Book a Consultation conversion (header/footer).
export function VeteransHero({ cta = 'consult' }: { cta?: 'consult' | 'scroll' }) {
  return (
    <section className="hero veterans">
      <div className="bg">
        <img src="/heroes/thank-you-veterans.png" alt="" />
      </div>
      <div className="grad" />
      <div className="wrap inner">
        <p className="eyebrow">NEUROSTRENGTH TRAINING</p>
        <h1>
          <span className="line">THANK YOU</span>
          <span className="line">VETERANS</span>
        </h1>
        <div className="veterans-copy">
          <p className="em">To every veteran who served, and to every human, your cognitive future is not fixed.</p>
          <p>There is more for you.</p>
          <p>We&apos;re here to serve you, from the neck up, with the same commitment you&apos;ve shown us.</p>
        </div>
        <div className="btns">
          {cta === 'scroll' ? (
            <a className="btn aqua" href="#next">
              Learn more
            </a>
          ) : (
            <ConsultFooterLink className="btn aqua">Learn more</ConsultFooterLink>
          )}
        </div>
      </div>
    </section>
  )
}
