import React from 'react'
import { LAB_SESSIONS, LAB_SESSIONS_HEADING } from '@/lib/lab-sessions'

export function LabSessions() {
  const [consult, ...training] = LAB_SESSIONS
  return (
    <section id="lab-sessions" className="sec paper labsess-sec" aria-labelledby="lab-sessions-heading">
      <div className="wrap">
        <h2 id="lab-sessions-heading" className="h2 labsess-heading">
          {LAB_SESSIONS_HEADING}
        </h2>

        <article className="labsess-card labsess-consult">
          <header className="labsess-card-head">
            <h3 className="labsess-title">{consult.title}</h3>
            <p className="labsess-duration">{consult.duration}</p>
          </header>
          <p className="labsess-lead">{consult.lead}</p>
          <p className="labsess-body">{consult.body}</p>
        </article>

        <div className="labsess-train" role="list">
          {training.map((s) => (
            <article key={s.title} className="labsess-card" role="listitem">
              <header className="labsess-card-head">
                <h3 className="labsess-title">
                  {s.title}
                  {s.isNew && <span className="labsess-new">New</span>}
                </h3>
                <p className="labsess-duration">{s.duration}</p>
              </header>
              <p className="labsess-lead">{s.lead}</p>
              <p className="labsess-body">{s.body}</p>
              {s.note && <p className="labsess-note">{s.note}</p>}
            </article>
          ))}
        </div>

        <div className="btns labsess-cta">
          <a className="btn aqua" href="#lab-locations">Book a Consultation</a>
        </div>
      </div>
    </section>
  )
}
