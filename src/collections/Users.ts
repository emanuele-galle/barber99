import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { it: 'Utente', en: 'User' },
    plural: { it: 'Utenti', en: 'Users' },
  },
  admin: {
    useAsTitle: 'email',
    group: { it: 'Sistema', en: 'System' },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        it: 'Nome',
        en: 'Name',
      },
    },
    {
      name: 'role',
      type: 'select',
      label: {
        it: 'Ruolo',
        en: 'Role',
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      defaultValue: 'staff',
      required: true,
    },
  ],
}
