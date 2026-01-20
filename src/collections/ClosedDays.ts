import type { CollectionConfig } from 'payload'

export const ClosedDays: CollectionConfig = {
  slug: 'closed-days',
  labels: {
    singular: { it: 'Giorno Chiusura', en: 'Closed Day' },
    plural: { it: 'Giorni Chiusura', en: 'Closed Days' },
  },
  admin: {
    useAsTitle: 'date',
    group: { it: 'Barbershop', en: 'Barbershop' },
    defaultColumns: ['date', 'type', 'reason', 'recurring'],
  },
  access: {
    read: () => true, // Public can read to check availability
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      label: {
        it: 'Data',
        en: 'Date',
      },
      required: true,
      unique: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'type',
      type: 'select',
      label: {
        it: 'Tipo',
        en: 'Type',
      },
      options: [
        { label: { it: 'Festivo', en: 'Holiday' }, value: 'holiday' },
        { label: { it: 'Ferie', en: 'Vacation' }, value: 'vacation' },
        { label: { it: 'Chiusura Speciale', en: 'Special Closure' }, value: 'special' },
      ],
      defaultValue: 'holiday',
      required: true,
    },
    {
      name: 'reason',
      type: 'text',
      label: {
        it: 'Motivo',
        en: 'Reason',
      },
      admin: {
        description: {
          it: 'Es. Natale, Ferie estive, ecc.',
          en: 'E.g. Christmas, Summer holidays, etc.',
        },
      },
    },
    {
      name: 'recurring',
      type: 'checkbox',
      label: {
        it: 'Ricorrente ogni anno',
        en: 'Recurring yearly',
      },
      defaultValue: false,
      admin: {
        description: {
          it: 'Se attivo, questa chiusura si ripete ogni anno',
          en: 'If enabled, this closure repeats every year',
        },
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
