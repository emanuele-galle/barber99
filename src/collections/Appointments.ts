import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: {
    singular: { it: 'Appuntamento', en: 'Appointment' },
    plural: { it: 'Appuntamenti', en: 'Appointments' },
  },
  admin: {
    useAsTitle: 'clientName',
    group: { it: 'Barbershop', en: 'Barbershop' },
    defaultColumns: ['clientName', 'date', 'time', 'service', 'status'],
    listSearchableFields: ['clientName', 'clientEmail', 'clientPhone'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return false
    },
    create: () => true, // Public can create appointments
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Client Information
    {
      type: 'row',
      fields: [
        {
          name: 'clientName',
          type: 'text',
          label: {
            it: 'Nome Cliente',
            en: 'Client Name',
          },
          required: true,
        },
        {
          name: 'clientEmail',
          type: 'email',
          label: {
            it: 'Email',
            en: 'Email',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'clientPhone',
          type: 'text',
          label: {
            it: 'Telefono',
            en: 'Phone',
          },
          required: true,
        },
        {
          name: 'preferredLanguage',
          type: 'select',
          label: {
            it: 'Lingua Preferita',
            en: 'Preferred Language',
          },
          options: [
            { label: 'Italiano', value: 'it' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'it',
        },
      ],
    },
    // Appointment Details
    {
      type: 'row',
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          label: {
            it: 'Servizio',
            en: 'Service',
          },
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
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          label: {
            it: 'Data',
            en: 'Date',
          },
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
          },
        },
        {
          name: 'time',
          type: 'text',
          label: {
            it: 'Ora',
            en: 'Time',
          },
          required: true,
          admin: {
            description: 'Formato HH:MM (es. 09:30)',
          },
        },
      ],
    },
    // Status and Notes
    {
      name: 'status',
      type: 'select',
      label: {
        it: 'Stato',
        en: 'Status',
      },
      options: [
        { label: { it: 'In Attesa', en: 'Pending' }, value: 'pending' },
        { label: { it: 'Confermato', en: 'Confirmed' }, value: 'confirmed' },
        { label: { it: 'Completato', en: 'Completed' }, value: 'completed' },
        { label: { it: 'Cancellato', en: 'Cancelled' }, value: 'cancelled' },
        { label: { it: 'No Show', en: 'No Show' }, value: 'noshow' },
        { label: { it: 'In Coda', en: 'In Queue' }, value: 'inqueue' },
        { label: { it: 'In Servizio', en: 'In Service' }, value: 'inservice' },
      ],
      defaultValue: 'confirmed',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    // Walk-in / Queue Management
    {
      name: 'appointmentType',
      type: 'select',
      label: {
        it: 'Tipo',
        en: 'Type',
      },
      options: [
        { label: { it: 'Prenotazione', en: 'Booking' }, value: 'booking' },
        { label: { it: 'Senza appuntamento', en: 'Walk-in' }, value: 'walkin' },
      ],
      defaultValue: 'booking',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'queuePosition',
      type: 'number',
      label: {
        it: 'Posizione in Coda',
        en: 'Queue Position',
      },
      admin: {
        position: 'sidebar',
        condition: (data) => data.appointmentType === 'walkin',
        description: { it: 'Posizione nella coda', en: 'Position in walk-in queue' },
      },
    },
    {
      name: 'checkedInAt',
      type: 'date',
      label: {
        it: 'Orario Arrivo',
        en: 'Check-in Time',
      },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
        description: { it: 'Orario in cui il cliente è arrivato', en: 'Time when client arrived' },
      },
    },
    {
      name: 'estimatedWaitMinutes',
      type: 'number',
      label: {
        it: 'Attesa Stimata (min)',
        en: 'Estimated Wait (min)',
      },
      admin: {
        position: 'sidebar',
        condition: (data) => data.appointmentType === 'walkin',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: {
        it: 'Note',
        en: 'Notes',
      },
      admin: {
        description: {
          it: 'Note interne o richieste speciali del cliente',
          en: 'Internal notes or special client requests',
        },
      },
    },
    // Notifications
    {
      name: 'confirmationSent',
      type: 'checkbox',
      label: {
        it: 'Email Conferma Inviata',
        en: 'Confirmation Email Sent',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'reminderSent',
      type: 'checkbox',
      label: {
        it: 'Reminder Inviato',
        en: 'Reminder Sent',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    // Linked Client (auto-populated)
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      label: {
        it: 'Cliente Collegato',
        en: 'Linked Client',
      },
      admin: {
        position: 'sidebar',
        description: {
          it: 'Collegamento automatico al profilo cliente',
          en: 'Auto-linked to client profile',
        },
      },
    },
    // Cancellation
    {
      name: 'cancellationToken',
      type: 'text',
      label: 'Token Cancellazione',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'cancelledAt',
      type: 'date',
      label: {
        it: 'Data Cancellazione',
        en: 'Cancelled At',
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'cancellationReason',
      type: 'text',
      label: {
        it: 'Motivo Cancellazione',
        en: 'Cancellation Reason',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Generate cancellation token on create
        if (operation === 'create' && !data.cancellationToken) {
          data.cancellationToken = crypto.randomUUID()
        }

        // Auto-link to client by phone number
        if (data.clientPhone && !data.client) {
          try {
            const payload = req.payload
            // Search for existing client by phone
            const existingClients = await payload.find({
              collection: 'clients',
              where: {
                phone: { equals: data.clientPhone },
              },
              limit: 1,
            })

            if (existingClients.docs.length > 0) {
              // Link to existing client
              data.client = existingClients.docs[0].id
            } else {
              // Create new client
              const newClient = await payload.create({
                collection: 'clients',
                data: {
                  name: data.clientName,
                  phone: data.clientPhone,
                  email: data.clientEmail || undefined,
                  tags: ['new'],
                  totalVisits: 0,
                  noShowCount: 0,
                  totalSpent: 0,
                },
              })
              data.client = newClient.id
              console.log(`Created new client: ${newClient.id} for phone ${data.clientPhone}`)
            }
          } catch (error) {
            console.error('Error linking/creating client:', error)
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Update client statistics when appointment status changes
        if (doc.client && operation === 'update' && previousDoc) {
          const payload = req.payload
          const statusChanged = previousDoc.status !== doc.status

          if (statusChanged) {
            try {
              const clientId = typeof doc.client === 'string' ? doc.client : doc.client.id
              const client = await payload.findByID({
                collection: 'clients',
                id: clientId,
              })

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const updates: any = {}

              // Completed: update totalVisits, lastVisit, totalSpent
              if (doc.status === 'completed' && previousDoc.status !== 'completed') {
                updates.totalVisits = (client.totalVisits || 0) + 1
                updates.lastVisit = doc.date

                // Get service price for totalSpent
                if (doc.service) {
                  try {
                    const serviceId = typeof doc.service === 'string' ? doc.service : doc.service.id
                    const service = await payload.findByID({
                      collection: 'services',
                      id: serviceId,
                    })
                    if (service.price) {
                      updates.totalSpent = (client.totalSpent || 0) + service.price
                    }
                  } catch (e) {
                    console.error('Error fetching service price:', e)
                  }
                }

                // Update tag from 'new' to 'regular' after first completed visit
                if (client.tags?.includes('new') && (client.totalVisits || 0) === 0) {
                  updates.tags = client.tags.filter((t: string) => t !== 'new').concat(['regular'])
                }
              }

              // No-show: increment noShowCount
              if (doc.status === 'noshow' && previousDoc.status !== 'noshow') {
                updates.noShowCount = (client.noShowCount || 0) + 1
              }

              // Apply updates if any
              if (Object.keys(updates).length > 0) {
                await payload.update({
                  collection: 'clients',
                  id: clientId,
                  data: updates,
                })
                console.log(`Updated client ${clientId} stats:`, updates)
              }

              // Review request logic (non-annoying)
              if (doc.status === 'completed' && previousDoc.status !== 'completed' && client.email && process.env.GOOGLE_REVIEW_URL) {
                const lastRequest = client.lastReviewRequestAt ? new Date(client.lastReviewRequestAt as string) : null
                const daysSinceLastRequest = lastRequest
                  ? (Date.now() - lastRequest.getTime()) / (1000 * 60 * 60 * 24)
                  : Infinity
                const updatedVisits = (client.totalVisits || 0) + 1

                if (updatedVisits >= 2 && daysSinceLastRequest > 60) {
                  const reviewWebhookUrl = process.env.N8N_WEBHOOK_URL
                  if (reviewWebhookUrl) {
                    let svcName = 'Servizio'
                    if (doc.service && typeof doc.service !== 'string') {
                      svcName = doc.service.name || svcName
                    }

                    await fetch(reviewWebhookUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event: 'review_request',
                        client_name: client.name,
                        client_email: client.email,
                        client_phone: client.phone,
                        google_review_url: process.env.GOOGLE_REVIEW_URL,
                        service_name: svcName,
                        barber_name: (doc.barber as string) || 'Barbiere',
                        date: doc.date,
                      }),
                    }).catch((err) => console.error('Review request webhook failed:', err))

                    await payload.update({
                      collection: 'clients',
                      id: clientId,
                      data: { lastReviewRequestAt: new Date().toISOString() },
                    }).catch((err) => console.error('Failed to update lastReviewRequestAt:', err))

                    console.log(`Review request sent for client ${clientId}`)
                  }
                }
              }
            } catch (error) {
              console.error('Error updating client statistics:', error)
            }
          }
        }

        // N8N Webhook logic
        // Skip for new appointments — route.ts handles the confirmation webhook
        // Only send webhooks for status changes (completed, cancelled, noshow, etc.)
        const webhookUrl = process.env.N8N_WEBHOOK_URL

        if (!webhookUrl || operation === 'create') {
          return doc
        }

        // Only send on actual status changes
        const statusChanged = previousDoc?.status !== doc.status
        if (!statusChanged) {
          return doc
        }

        try {
          const payload = req.payload
          let serviceName = 'Servizio'
          let serviceDuration = 45
          let servicePrice = 0

          if (doc.service && typeof doc.service !== 'string') {
            serviceName = doc.service.name || serviceName
            serviceDuration = doc.service.duration || serviceDuration
            servicePrice = doc.service.price || servicePrice
          } else if (doc.service) {
            try {
              const service = await payload.findByID({
                collection: 'services',
                id: doc.service as string,
              })
              serviceName = service.name || serviceName
              serviceDuration = service.duration || serviceDuration
              servicePrice = service.price || servicePrice
            } catch (e) {
              console.error('Error fetching service:', e)
            }
          }

          const barberName = (doc.barber as string) || 'Barbiere'

          // Flat payload matching N8N template format (snake_case)
          const webhookPayload = {
            event: `appointment_${doc.status}`,
            appointment_id: String(doc.id),
            client_name: doc.clientName,
            client_email: doc.clientEmail || '',
            client_phone: doc.clientPhone,
            service_name: serviceName,
            barber_name: barberName,
            date: new Date(doc.date as string).toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            time: doc.time,
            duration: serviceDuration,
            price: servicePrice ? `€${servicePrice}` : 'Da confermare',
            status: doc.status,
            previous_status: previousDoc?.status,
          }

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload),
          })

          if (response.ok) {
            console.log(`N8N webhook sent for appointment_${doc.status}: ${doc.id}`)
          } else {
            console.error(`N8N webhook failed: ${response.status} ${response.statusText}`)
          }
        } catch (error) {
          console.error('Error sending N8N webhook:', error)
        }

        return doc
      },
    ],
  },
  timestamps: true,
}
