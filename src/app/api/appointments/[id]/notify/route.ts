import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

interface NotificationPayload {
  event: 'manual_reminder' | 'confirmation' | 'cancellation'
  appointment_id: string
  client_name: string
  client_email: string
  client_phone: string
  service_name: string
  barber_name: string
  date: string
  time: string
  duration: number
  price: string
  notes?: string
}

async function sendNotification(data: NotificationPayload) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send notification:', error)
    return false
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body = await request.json()

    const notificationType = body.type || 'reminder'

    // Fetch the appointment with related data
    const appointment = await payload.findByID({
      collection: 'appointments',
      id,
      depth: 2,
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Get service details
    const service = typeof appointment.service === 'object' ? appointment.service : null
    // Barber is now a simple text field
    const barberName = (appointment.barber as string) || 'Cosimo Pisani'

    // Format date for display
    const formattedDate = new Date(appointment.date as string).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Build notification payload
    const notificationData: NotificationPayload = {
      event: notificationType === 'reminder' ? 'manual_reminder' : notificationType,
      appointment_id: String(appointment.id),
      client_name: appointment.clientName as string,
      client_email: appointment.clientEmail as string,
      client_phone: appointment.clientPhone as string,
      service_name: service?.name || 'Servizio',
      barber_name: barberName,
      date: formattedDate,
      time: appointment.time as string,
      duration: service?.duration || 45,
      price: service?.price ? `€${service.price}` : 'Da confermare',
      notes: appointment.notes as string | undefined,
    }

    // Send notification via N8N webhook
    const sent = await sendNotification(notificationData)

    if (sent) {
      // Update reminder sent flag
      await payload.update({
        collection: 'appointments',
        id,
        data: {
          reminderSent: true,
          lastNotificationAt: new Date().toISOString(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
