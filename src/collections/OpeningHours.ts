import type { CollectionConfig } from 'payload'

export const OpeningHours: CollectionConfig = {
  slug: 'opening-hours',
  labels: {
    singular: { it: 'Orario', en: 'Opening Hour' },
    plural: { it: 'Orari di Apertura', en: 'Opening Hours' },
  },
  admin: {
    useAsTitle: 'dayOfWeek',
    group: { it: 'Impostazioni', en: 'Settings' },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'dayOfWeek',
      type: 'select',
      label: {
        it: 'Giorno',
        en: 'Day',
      },
      options: [
        { label: { it: 'Lunedì', en: 'Monday' }, value: 'monday' },
        { label: { it: 'Martedì', en: 'Tuesday' }, value: 'tuesday' },
        { label: { it: 'Mercoledì', en: 'Wednesday' }, value: 'wednesday' },
        { label: { it: 'Giovedì', en: 'Thursday' }, value: 'thursday' },
        { label: { it: 'Venerdì', en: 'Friday' }, value: 'friday' },
        { label: { it: 'Sabato', en: 'Saturday' }, value: 'saturday' },
        { label: { it: 'Domenica', en: 'Sunday' }, value: 'sunday' },
      ],
      required: true,
      unique: true,
    },
    {
      name: 'isClosed',
      type: 'checkbox',
      label: {
        it: 'Chiuso',
        en: 'Closed',
      },
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'openTime',
          type: 'text',
          label: {
            it: 'Apertura',
            en: 'Opening',
          },
          defaultValue: '09:00',
          admin: {
            description: 'Formato HH:MM',
            condition: (data) => !data.isClosed,
          },
        },
        {
          name: 'closeTime',
          type: 'text',
          label: {
            it: 'Chiusura',
            en: 'Closing',
          },
          defaultValue: '19:30',
          admin: {
            description: 'Formato HH:MM',
            condition: (data) => !data.isClosed,
          },
        },
      ],
    },
    {
      name: 'breakStart',
      type: 'text',
      label: {
        it: 'Inizio Pausa',
        en: 'Break Start',
      },
      admin: {
        description: 'Formato HH:MM (opzionale)',
        condition: (data) => !data.isClosed,
      },
    },
    {
      name: 'breakEnd',
      type: 'text',
      label: {
        it: 'Fine Pausa',
        en: 'Break End',
      },
      admin: {
        description: 'Formato HH:MM (opzionale)',
        condition: (data) => !data.isClosed,
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordine',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
