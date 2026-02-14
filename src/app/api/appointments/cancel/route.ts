import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bookingEvents } from '@/lib/booking-events'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`cancel:${ip}`, RATE_LIMITS.cancel)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

    const { token, reason } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find appointment by cancellation token
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        cancellationToken: { equals: token },
      },
      limit: 1,
    })

    if (appointments.docs.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    const appointment = appointments.docs[0]

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      return NextResponse.json({ error: 'Prenotazione gia cancellata' }, { status: 400 })
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}:00`)
    if (appointmentDate < new Date()) {
      return NextResponse.json({ error: 'Non puoi cancellare un appuntamento passato' }, { status: 400 })
    }

    // Fetch service name for notification
    const fullApt = await payload.findByID({ collection: 'appointments', id: appointment.id, depth: 1 })
    const serviceName = typeof fullApt.service === 'object' && fullApt.service ? (fullApt.service as { name?: string }).name || 'Servizio' : 'Servizio'

    // Cancel the appointment
    await payload.update({
      collection: 'appointments',
      id: appointment.id,
      data: {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason || 'Cancellato dal cliente',
      },
    })

    // Emit SSE event for real-time admin notification
    const dateFormatted = new Date(String(appointment.date).split('T')[0] + 'T00:00:00').toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    bookingEvents.emit('cancellation', {
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      serviceName,
      date: dateFormatted,
      time: appointment.time,
    })

    // Send cancellation notification email
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'cancellation',
          client_name: appointment.clientName,
          client_email: appointment.clientEmail || '',
          client_phone: appointment.clientPhone,
          service_name: serviceName,
          date: dateFormatted,
          time: appointment.time,
          reason: reason || 'Cancellato dal cliente',
        }),
        signal: AbortSignal.timeout(10000),
      })
    } catch (e) {
      console.error('Failed to send cancellation notification:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Prenotazione cancellata con successo',
    })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json({ error: 'Errore durante la cancellazione' }, { status: 500 })
  }
}

// GET - Check appointment status by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        cancellationToken: { equals: token },
      },
      limit: 1,
      depth: 1,
    })

    if (appointments.docs.length === 0) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    const apt = appointments.docs[0]
    const serviceName = typeof apt.service === 'object' ? apt.service.name : 'Servizio'

    return NextResponse.json({
      clientName: apt.clientName,
      date: apt.date,
      time: apt.time,
      service: serviceName,
      status: apt.status,
    })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
