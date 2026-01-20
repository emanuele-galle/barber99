import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: {
    it: 'Impostazioni Sito',
    en: 'Site Settings',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: {
      it: 'Impostazioni',
      en: 'Settings',
    },
  },
  fields: [
    // Business Info
    {
      name: 'businessInfo',
      type: 'group',
      label: {
        it: 'Informazioni Salone',
        en: 'Business Info',
      },
      fields: [
        {
          name: 'businessName',
          type: 'text',
          label: {
            it: 'Nome Salone',
            en: 'Business Name',
          },
          required: true,
          defaultValue: 'Barber 99',
        },
        {
          name: 'ownerName',
          type: 'text',
          label: {
            it: 'Proprietario',
            en: 'Owner Name',
          },
          defaultValue: 'Cosimo Pisani',
        },
        {
          name: 'address',
          type: 'text',
          label: {
            it: 'Indirizzo',
            en: 'Address',
          },
          defaultValue: 'Via San Biagio 3',
        },
        {
          name: 'city',
          type: 'text',
          label: {
            it: 'Città',
            en: 'City',
          },
          defaultValue: '89822 Serra San Bruno (VV)',
        },
        {
          name: 'phone',
          type: 'text',
          label: {
            it: 'Telefono',
            en: 'Phone',
          },
          defaultValue: '+39 327 126 3091',
        },
        {
          name: 'email',
          type: 'email',
          label: {
            it: 'Email',
            en: 'Email',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
          defaultValue: '@barber___99',
          admin: {
            description: 'Handle Instagram (es: @barber___99)',
          },
        },
      ],
    },
    // Booking Settings
    {
      name: 'booking',
      type: 'group',
      label: {
        it: 'Impostazioni Prenotazioni',
        en: 'Booking Settings',
      },
      fields: [
        {
          name: 'slotInterval',
          type: 'number',
          label: {
            it: 'Intervallo Slot (minuti)',
            en: 'Slot Interval (minutes)',
          },
          defaultValue: 30,
          min: 10,
          max: 120,
          admin: {
            description: {
              it: 'Durata minima tra gli appuntamenti',
              en: 'Minimum duration between appointments',
            },
          },
        },
        {
          name: 'minAdvanceHours',
          type: 'number',
          label: {
            it: 'Anticipo Minimo (ore)',
            en: 'Minimum Advance (hours)',
          },
          defaultValue: 2,
          min: 0,
          max: 48,
          admin: {
            description: {
              it: 'Ore minime di anticipo per prenotare',
              en: 'Minimum hours in advance to book',
            },
          },
        },
        {
          name: 'maxAdvanceDays',
          type: 'number',
          label: {
            it: 'Anticipo Massimo (giorni)',
            en: 'Maximum Advance (days)',
          },
          defaultValue: 30,
          min: 1,
          max: 90,
          admin: {
            description: {
              it: 'Giorni massimi in anticipo per prenotare',
              en: 'Maximum days in advance to book',
            },
          },
        },
      ],
    },
    // Notifications
    {
      name: 'notifications',
      type: 'group',
      label: {
        it: 'Notifiche',
        en: 'Notifications',
      },
      fields: [
        {
          name: 'emailConfirmation',
          type: 'checkbox',
          label: {
            it: 'Email di Conferma',
            en: 'Confirmation Email',
          },
          defaultValue: true,
          admin: {
            description: {
              it: 'Invia email di conferma alla prenotazione',
              en: 'Send confirmation email on booking',
            },
          },
        },
        {
          name: 'autoReminder',
          type: 'checkbox',
          label: {
            it: 'Reminder Automatico',
            en: 'Auto Reminder',
          },
          defaultValue: true,
          admin: {
            description: {
              it: 'Invia reminder 24h prima dell\'appuntamento',
              en: 'Send reminder 24h before appointment',
            },
          },
        },
        {
          name: 'n8nWebhookActive',
          type: 'checkbox',
          label: {
            it: 'Webhook N8N Attivo',
            en: 'N8N Webhook Active',
          },
          defaultValue: true,
          admin: {
            description: {
              it: 'Integrazione con N8N per automazioni',
              en: 'N8N integration for automations',
            },
          },
        },
      ],
    },
  ],
}
