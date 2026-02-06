import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

async function sendBookingNotification(data: {
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
}) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.ok
  } catch (error) {
    console.error('Failed to send booking notification:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const {
      service,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = body

    // Validate required fields
    if (!service || !date || !time || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch service details for the notification
    const serviceDoc = await payload.findByID({ collection: 'services', id: service })

    // Single barber - hardcoded
    const DEFAULT_BARBER_NAME = 'Cosimo Pisani'

    // Create appointment in Payload CMS
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        service,
        barber: DEFAULT_BARBER_NAME,
        date,
        time,
        clientName,
        clientEmail,
        clientPhone,
        notes: notes || '',
        status: 'pending',
        emailSent: false,
        whatsappSent: false,
      },
    })

    // Send confirmation email via N8N webhook
    const emailSent = await sendBookingNotification({
      appointment_id: String(appointment.id),
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      service_name: serviceDoc?.name || 'Servizio',
      barber_name: DEFAULT_BARBER_NAME,
      date: new Date(date).toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time,
      duration: serviceDoc?.duration || 45,
      price: serviceDoc?.price ? `€${serviceDoc.price}` : 'Da confermare',
    })

    // Update emailSent status
    if (emailSent) {
      await payload.update({
        collection: 'appointments',
        id: appointment.id,
        data: { emailSent: true },
      })
    }

    // Build cancellation and WhatsApp links
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.fodivps2.cloud'
    const cancellationLink = `${baseUrl}/cancella?token=${appointment.cancellationToken}`
    const formattedDate = new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    const whatsappText = encodeURIComponent(
      `Ciao! Ho prenotato un appuntamento da Barber 99:\n` +
      `Servizio: ${serviceDoc?.name || 'Servizio'}\n` +
      `Data: ${formattedDate}\n` +
      `Ora: ${time}\n` +
      `Nome: ${clientName}`
    )
    const whatsappLink = `https://wa.me/393271263091?text=${whatsappText}`

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      message: 'Appointment created successfully',
      emailSent,
      cancellationLink,
      whatsappLink,
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Fetch appointments for the date
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          { date: { equals: date } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
      depth: 1,
    })

    // Return simplified slot data (for availability checking)
    const bookedSlots = appointments.docs.map((apt) => ({
      time: apt.time,
      duration: typeof apt.service === 'object' ? apt.service.duration : 45,
    }))

    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
