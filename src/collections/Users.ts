import type { CollectionConfig } from 'payload'
import { isAdmin, adminOrSelf, adminFieldOnly } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: true,
  access: {
    read: adminOrSelf,
    create: isAdmin, // admins invite/create teammates
    update: adminOrSelf, // admins edit anyone; users edit themselves
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(user), // both roles can open the admin panel
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true, // exposed on req.user for access checks
      options: [
        { label: 'Admin — full control + user management', value: 'admin' },
        { label: 'Editor — create & edit content', value: 'editor' },
      ],
      access: { update: adminFieldOnly }, // only admins can change roles
      admin: { description: 'Admins manage users & settings. Editors manage content.' },
    },
  ],
  versions: false,
}
