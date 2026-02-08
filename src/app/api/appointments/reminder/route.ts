import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const SYNC_SECRET = process.env.INSTAGRAM_SYNC_SECRET
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret')
    if (!SYNC_SECRET || secret !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find appointments for tomorrow that haven't had reminders sent
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const dayAfterStr = new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]

    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          { date: { greater_than_equal: `${tomorrowStr}T00:00:00.000Z` } },
          { date: { less_than: `${dayAfterStr}T00:00:00.000Z` } },
          { status: { in: ['pending', 'confirmed'] } },
          { reminderSent: { equals: false } },
        ],
      },
      depth: 1,
      limit: 100,
    })

    let sent = 0

    for (const apt of appointments.docs) {
      const serviceName = typeof apt.service === 'object' ? apt.service.name : 'Servizio'
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.it'
      const cancelLink = `${baseUrl}/cancella?token=${apt.cancellationToken}`

      // Build WhatsApp reminder message
      const formattedDate = new Date(tomorrowStr).toLocaleDateString('it-IT', {
        weekday: 'long', day: 'numeric', month: 'long',
      })

      // Send reminder via N8N webhook
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'appointment_reminder',
            appointment: {
              id: apt.id,
              clientName: apt.clientName,
              clientEmail: apt.clientEmail,
              clientPhone: apt.clientPhone,
              date: apt.date,
              dateFormatted: formattedDate,
              time: apt.time,
              serviceName,
              cancellationLink: cancelLink,
            },
          }),
        })

        // Mark reminder as sent
        await payload.update({
          collection: 'appointments',
          id: apt.id,
          data: { reminderSent: true },
        })
        sent++
      } catch (err) {
        console.error(`Failed to send reminder for appointment ${apt.id}:`, err)
      }
    }

    return NextResponse.json({
      sent,
      total: appointments.docs.length,
      date: tomorrowStr,
    })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
