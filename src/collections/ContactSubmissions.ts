import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: { it: 'Richiesta Contatto', en: 'Contact Request' },
    plural: { it: 'Richieste Contatto', en: 'Contact Requests' },
  },
  admin: {
    useAsTitle: 'name',
    group: { it: 'Sistema', en: 'System' },
    defaultColumns: ['name', 'email', 'subject', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // Public can submit
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: {
            it: 'Nome',
            en: 'Name',
          },
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
        },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      label: {
        it: 'Telefono',
        en: 'Phone',
      },
    },
    {
      name: 'subject',
      type: 'select',
      label: {
        it: 'Oggetto',
        en: 'Subject',
      },
      options: [
        { label: { it: 'Informazioni Generali', en: 'General Info' }, value: 'info' },
        { label: { it: 'Prenotazione', en: 'Booking' }, value: 'booking' },
        { label: { it: 'Collaborazione', en: 'Collaboration' }, value: 'collaboration' },
        { label: { it: 'Reclamo', en: 'Complaint' }, value: 'complaint' },
        { label: { it: 'Altro', en: 'Other' }, value: 'other' },
      ],
      defaultValue: 'info',
    },
    {
      name: 'message',
      type: 'textarea',
      label: {
        it: 'Messaggio',
        en: 'Message',
      },
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      label: {
        it: 'Stato',
        en: 'Status',
      },
      options: [
        { label: { it: 'Nuovo', en: 'New' }, value: 'new' },
        { label: { it: 'Letto', en: 'Read' }, value: 'read' },
        { label: { it: 'Risposto', en: 'Replied' }, value: 'replied' },
        { label: { it: 'Archiviato', en: 'Archived' }, value: 'archived' },
      ],
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: {
        it: 'Note Interne',
        en: 'Internal Notes',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
