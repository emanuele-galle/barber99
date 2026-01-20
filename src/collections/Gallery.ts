import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: { it: 'Foto Galleria', en: 'Gallery Photo' },
    plural: { it: 'Galleria', en: 'Gallery' },
  },
  admin: {
    useAsTitle: 'title',
    group: { it: 'Contenuti', en: 'Content' },
    defaultColumns: ['title', 'category', 'featured'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        it: 'Titolo',
        en: 'Title',
      },
      required: true,
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: {
        it: 'Immagine',
        en: 'Image',
      },
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: {
        it: 'Categoria',
        en: 'Category',
      },
      options: [
        { label: { it: 'Taglio', en: 'Haircut' }, value: 'haircut' },
        { label: { it: 'Barba', en: 'Beard' }, value: 'beard' },
        { label: { it: 'Styling', en: 'Styling' }, value: 'styling' },
        { label: { it: 'Before/After', en: 'Before/After' }, value: 'before-after' },
        { label: { it: 'Negozio', en: 'Shop' }, value: 'shop' },
      ],
      required: true,
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
