import type { Metadata } from 'next'
import React from 'react'
import { Reveal } from '@/components/Reveal'
import { SITE_URL, webPageGraph } from '@/lib/seo'
import { AppSupportForm } from '@/components/AppSupportForm'

// NESTRE app help & support at the exact URL the mobile app links to
// (/nestre-app/help): account-deletion steps, subscription-cancel links, and the
// Contact NESTRE App Support form. Shared legal-page pattern + consult-field form.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NESTRE App Help & Support',
  description: 'Get help with the NESTRE app — delete your account, cancel a subscription, or contact NESTRE app support.',
  alternates: { canonical: `${SITE_URL}/nestre-app/help` },
  openGraph: { title: 'NESTRE App Help & Support · NESTRE', url: `${SITE_URL}/nestre-app/help`, images: [{ url: '/og', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'NESTRE App Help & Support · NESTRE', images: ['/og'] },
}

const IOS_CANCEL = 'https://support.apple.com/en-us/HT202039'
const ANDROID_CANCEL = 'https://support.google.com/googleplay/answer/7018481'

export default function NestreAppHelpPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageGraph('NESTRE App Help & Support', '/nestre-app/help', 'Get help with the NESTRE app — delete your account, cancel a subscription, or contact NESTRE app support.')) }} />
      <main id="main" className="legal-page">
        <section className="sec paper">
          <div className="wrap legal">
            <p className="eyebrow">Support</p>
            <h1 className="h2" style={{ marginTop: 12 }}>NESTRE App Help &amp; Support</h1>

            <div className="legal-body">
              <h2>Want to delete your NESTRE App account?</h2>
              <p>To delete your account in the NESTRE Health &amp; Performance app please follow the steps below:</p>
              <ol>
                <li>Login to the NESTRE Health &amp; Performance app with the email of the account you want to delete.</li>
                <li>Tap on the settings icon in the top left of the Profile page.</li>
                <li>Tap on Account Settings.</li>
                <li>Tap on Delete Account.</li>
              </ol>
              <p>This will delete all personal data associated with the NESTRE Health &amp; Performance app. This includes email, name, birthday, NESTRE mindset profile, all NESTRE in-app cognitive training data, and all other data associated with the NESTRE Health &amp; Performance app. NESTRE does not retain any personal data that was used in the NESTRE Health &amp; Performance app.</p>

              <h2>Cancel your subscription</h2>
              <ul>
                <li>To cancel your subscription on iPhone: <a href={IOS_CANCEL} target="_blank" rel="noopener noreferrer">Click here for instructions</a>.</li>
                <li>To cancel your subscription on Android: <a href={ANDROID_CANCEL} target="_blank" rel="noopener noreferrer">Click here for instructions</a>.</li>
              </ul>

              <h2>Contact NESTRE App Support</h2>
              <p>Any further questions or inquiries? Please use the form below to contact NESTRE app support.</p>
            </div>

            <AppSupportForm />
          </div>
        </section>
      </main>
      <Reveal />
    </>
  )
}
