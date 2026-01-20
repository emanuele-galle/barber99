import type { CollectionConfig } from 'payload'

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  labels: {
    singular: { it: 'Post Instagram', en: 'Instagram Post' },
    plural: { it: 'Post Instagram', en: 'Instagram Posts' },
  },
  admin: {
    useAsTitle: 'caption',
    group: { it: 'Contenuti', en: 'Content' },
    defaultColumns: ['instagramId', 'mediaType', 'timestamp'],
    description: 'Post Instagram sincronizzati automaticamente. Non modificare manualmente.',
  },
  access: {
    read: () => true,
    // Write access restricted - populated by N8N sync
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'instagramId',
      type: 'text',
      label: 'Instagram ID',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'mediaUrl',
      type: 'text',
      label: 'Media URL',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      label: 'Thumbnail URL',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'permalink',
      type: 'text',
      label: 'Instagram Link',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: {
        it: 'Didascalia',
        en: 'Caption',
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'mediaType',
      type: 'select',
      label: 'Tipo Media',
      options: [
        { label: 'Immagine', value: 'IMAGE' },
        { label: 'Video', value: 'VIDEO' },
        { label: 'Carousel', value: 'CAROUSEL_ALBUM' },
      ],
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      label: 'Data Pubblicazione',
      required: true,
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'isVisible',
      type: 'checkbox',
      label: {
        it: 'Visibile in Galleria',
        en: 'Visible in Gallery',
      },
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Deseleziona per nascondere questo post dalla galleria',
      },
    },
  ],
  timestamps: true,
}
