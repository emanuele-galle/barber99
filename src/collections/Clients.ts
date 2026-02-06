import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: {
    singular: { it: 'Cliente', en: 'Client' },
    plural: { it: 'Clienti', en: 'Clients' },
  },
  admin: {
    useAsTitle: 'name',
    group: { it: 'Barbershop', en: 'Barbershop' },
    defaultColumns: ['name', 'phone', 'totalVisits', 'lastVisit'],
    listSearchableFields: ['name', 'phone', 'email'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Contact Information
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: {
            it: 'Nome Completo',
            en: 'Full Name',
          },
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          label: {
            it: 'Telefono',
            en: 'Phone',
          },
          required: true,
          unique: true,
          admin: {
            description: { it: 'Usato per identificare il cliente', en: 'Used to identify client' },
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      label: {
        it: 'Email',
        en: 'Email',
      },
    },
    // Preferences
    {
      name: 'preferences',
      type: 'group',
      label: {
        it: 'Preferenze',
        en: 'Preferences',
      },
      fields: [
        {
          name: 'hairNotes',
          type: 'textarea',
          label: {
            it: 'Note Capelli/Stile',
            en: 'Hair/Style Notes',
          },
          admin: {
            description: {
              it: 'Es: sfumatura bassa, taglio corto sui lati, gel leggero',
              en: 'E.g.: low fade, short on sides, light gel',
            },
          },
        },
        {
          name: 'preferredServices',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
          label: {
            it: 'Servizi Preferiti',
            en: 'Preferred Services',
          },
        },
      ],
    },
    // Notes
    {
      name: 'notes',
      type: 'textarea',
      label: {
        it: 'Note Interne',
        en: 'Internal Notes',
      },
      admin: {
        description: {
          it: 'Note private visibili solo allo staff',
          en: 'Private notes visible only to staff',
        },
      },
    },
    // Statistics (auto-updated)
    {
      name: 'totalVisits',
      type: 'number',
      label: {
        it: 'Visite Totali',
        en: 'Total Visits',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastVisit',
      type: 'date',
      label: {
        it: 'Ultima Visita',
        en: 'Last Visit',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'noShowCount',
      type: 'number',
      label: {
        it: 'No-Show',
        en: 'No-Shows',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: { it: 'Numero di volte che non si è presentato', en: 'Times they didn\'t show up' },
      },
    },
    {
      name: 'totalSpent',
      type: 'number',
      label: {
        it: 'Totale Speso (€)',
        en: 'Total Spent (€)',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'lastReviewRequestAt',
      type: 'date',
      label: {
        it: 'Ultima Richiesta Recensione',
        en: 'Last Review Request',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    // Tags for segmentation
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      label: {
        it: 'Etichette',
        en: 'Tags',
      },
      options: [
        { label: { it: 'VIP', en: 'VIP' }, value: 'vip' },
        { label: { it: 'Nuovo', en: 'New' }, value: 'new' },
        { label: { it: 'Abituale', en: 'Regular' }, value: 'regular' },
        { label: { it: 'Inattivo', en: 'Inactive' }, value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // Authentication fields (for client self-service portal)
    {
      name: 'password',
      type: 'text',
      label: {
        it: 'Password',
        en: 'Password',
      },
      admin: {
        hidden: true, // Never show in admin UI
      },
    },
    {
      name: 'isRegistered',
      type: 'checkbox',
      label: {
        it: 'Account Registrato',
        en: 'Registered Account',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: {
          it: 'Il cliente ha creato un account',
          en: 'Client has created an account',
        },
      },
    },
  ],
  timestamps: true,
}
