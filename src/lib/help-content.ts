// Help & Support body — rebuilt from nestreperformance.com/nestre-app/help/ into
// our design system. Same { t, x } block shape as the Terms/Privacy content.

type Block = { t: 'h2' | 'h3' | 'p' | 'li'; x: string }

export const HELP: Block[] = [
  { t: 'p', x: `Questions about the NESTRE app, your subscription, or your account? Our team is here to help.` },

  { t: 'h2', x: `Contact support` },
  { t: 'p', x: `Reach the NESTRE App Support team and we’ll get back to you as soon as we can.` },
  { t: 'li', x: `By email: info@nestreperformance.com` },
  { t: 'li', x: `By phone: 689-710-3260` },

  { t: 'h2', x: `Delete your account` },
  { t: 'p', x: `Want to delete your NESTRE Health & Performance app account? Contact NESTRE App Support and we’ll process your request. Please include the device type you use (iOS or Android) and the email address associated with your account.` },

  { t: 'h2', x: `Disclaimer` },
  { t: 'p', x: `NESTRE™ does not offer medical diagnosis or treatment advice to any person or organization. NESTRE makes no claims that it can cure any conditions. If you take prescription medications for any condition, you should consult with your physician before discontinuing use of such medications. NESTRE services are not intended to treat any medical conditions and are only marketed as enhancing general wellness.` },
]
