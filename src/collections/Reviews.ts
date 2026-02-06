import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: { it: 'Recensione', en: 'Review' },
    plural: { it: 'Recensioni', en: 'Reviews' },
  },
  admin: {
    useAsTitle: 'author',
    group: { it: 'Contenuti', en: 'Content' },
    defaultColumns: ['author', 'rating', 'featured', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'googleReviewId',
      type: 'text',
      label: { it: 'ID Google Review', en: 'Google Review ID' },
      unique: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'author',
      type: 'text',
      label: {
        it: 'Autore',
        en: 'Author',
      },
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      label: {
        it: 'Valutazione',
        en: 'Rating',
      },
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: 'text',
      type: 'textarea',
      label: {
        it: 'Testo Recensione',
        en: 'Review Text',
      },
      required: true,
      localized: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      label: {
        it: 'Servizio',
        en: 'Service',
      },
    },
    {
      name: 'barber',
      type: 'text',
      label: {
        it: 'Barbiere',
        en: 'Barber',
      },
      defaultValue: 'Cosimo Pisani',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'source',
      type: 'select',
      label: {
        it: 'Fonte',
        en: 'Source',
      },
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: { it: 'Sito Web', en: 'Website' }, value: 'website' },
      ],
      defaultValue: 'google',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: {
        it: 'In Evidenza',
        en: 'Featured',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: {
        it: 'Verificata',
        en: 'Verified',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
