import type { Access, FieldAccess } from 'payload'

/* Role-based access for Nestre CMS.
   - admin  : full control incl. user management + settings
   - editor : create/edit content (pages, media, nav/footer/brand), not users */

export const isAdmin: Access = ({ req: { user } }) => (user as any)?.role === 'admin' // eslint-disable-line @typescript-eslint/no-explicit-any
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)
export const anyone: Access = () => true

// Admins see/manage everyone; a non-admin is scoped to their own user doc.
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as any).role === 'admin') return true // eslint-disable-line @typescript-eslint/no-explicit-any
  return { id: { equals: user.id } }
}

// Only admins may change a field (e.g. a user's role).
export const adminFieldOnly: FieldAccess = ({ req: { user } }) => (user as any)?.role === 'admin' // eslint-disable-line @typescript-eslint/no-explicit-any
