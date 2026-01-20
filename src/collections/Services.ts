import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: { it: 'Servizio', en: 'Service' },
    plural: { it: 'Servizi', en: 'Services' },
  },
  admin: {
    useAsTitle: 'name',
    group: { it: 'Barbershop', en: 'Barbershop' },
    defaultColumns: ['name', 'price', 'duration', 'category'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        it: 'Nome Servizio',
        en: 'Service Name',
      },
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: {
        it: 'Descrizione',
        en: 'Description',
      },
      localized: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: {
        it: 'Descrizione Breve',
        en: 'Short Description',
      },
      maxLength: 200,
      localized: true,
    },
    {
      name: 'price',
      type: 'number',
      label: {
        it: 'Prezzo (€)',
        en: 'Price (€)',
      },
      required: true,
      min: 0,
    },
    {
      name: 'duration',
      type: 'number',
      label: {
        it: 'Durata (minuti)',
        en: 'Duration (minutes)',
      },
      required: true,
      min: 15,
      defaultValue: 30,
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
        { label: { it: 'Trattamento', en: 'Treatment' }, value: 'treatment' },
        { label: { it: 'Pacchetto', en: 'Package' }, value: 'package' },
      ],
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: {
        it: 'Immagine',
        en: 'Image',
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: {
        it: 'Icona (Lucide)',
        en: 'Icon (Lucide)',
      },
      admin: {
        description: 'Nome icona Lucide (es. Scissors, Crown, Droplets)',
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
      name: 'active',
      type: 'checkbox',
      label: {
        it: 'Attivo',
        en: 'Active',
      },
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: {
        it: 'Ordine',
        en: 'Order',
      },
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
