import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { it: 'Media', en: 'Media' },
    plural: { it: 'Media', en: 'Media' },
  },
  admin: {
    group: { it: 'Contenuti', en: 'Content' },
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: {
        it: 'Testo alternativo',
        en: 'Alt text',
      },
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: {
        it: 'Didascalia',
        en: 'Caption',
      },
    },
  ],
}
