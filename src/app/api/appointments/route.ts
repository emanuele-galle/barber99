import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isSlotAvailable, defaultOpeningHours, isDateClosed } from '@/lib/booking'
import { bookingEvents } from '@/lib/booking-events'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

// Helper: build date range query for Payload (handles ISO timezone issues)
function dateRangeQuery(date: string) {
  return [
    { date: { greater_than_equal: `${date}T00:00:00.000Z` } },
    { date: { less_than: `${date}T23:59:59.999Z` } },
  ]
}

// Fetch opening hours from CMS with fallback to defaults
async function getOpeningHours(payload: Awaited<ReturnType<typeof getPayload>>) {
  try {
    const result = await payload.find({ collection: 'opening-hours', limit: 7 })
    if (result.docs.length > 0) {
      const dayNameToNumber: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      }
      return result.docs.map((h) => ({
        dayOfWeek: dayNameToNumber[h.dayOfWeek as string] ?? 0,
        openTime: (h.openTime as string) || '09:00',
        closeTime: (h.closeTime as string) || '19:30',
        isClosed: Boolean(h.isClosed),
        breakStart: h.breakStart as string | undefined,
        breakEnd: h.breakEnd as string | undefined,
      }))
    }
  } catch (e) {
    console.error('Error fetching opening hours:', e)
  }
  return defaultOpeningHours
}

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

import { requireAdmin } from '@/lib/admin-auth'

// Check if request is from an authenticated admin
async function isAdminRequest(request: NextRequest) {
  const user = await requireAdmin(request)
  return !!user
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Rate limiting (skip for admin bookings, checked after body parse)
    const ip = getClientIP(request)

    const body = await request.json()

    const {
      service,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      isAdminBooking,
    } = body

    // Rate limiting for non-admin requests
    if (!isAdminBooking) {
      const { allowed } = rateLimit(`booking:${ip}`, RATE_LIMITS.booking)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
          { status: 429 }
        )
      }
    }

    // Validate required fields (email is optional)
    if (!service || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Input validation: format and length
    if (typeof clientName !== 'string' || clientName.length > 100) {
      return NextResponse.json({ error: 'Nome non valido' }, { status: 400 })
    }
    if (typeof clientPhone !== 'string' || clientPhone.length > 20) {
      return NextResponse.json({ error: 'Telefono non valido' }, { status: 400 })
    }
    if (clientEmail && (typeof clientEmail !== 'string' || clientEmail.length > 254)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    }
    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return NextResponse.json({ error: 'Note troppo lunghe (max 500 caratteri)' }, { status: 400 })
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'Formato ora non valido' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Formato data non valido' }, { status: 400 })
    }

    // Fetch service details
    const serviceDoc = await payload.findByID({ collection: 'services', id: service })
    const serviceDuration = serviceDoc?.duration || 45

    // --- FASE 2: Limite 1 prenotazione attiva per persona ---
    // Skip for admin bookings
    const isAdmin = isAdminBooking && await isAdminRequest(request)

    if (!isAdmin) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      const existingBooking = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            { clientPhone: { equals: clientPhone } },
            { status: { in: ['pending', 'confirmed'] } },
            { date: { greater_than_equal: todayStr } },
          ],
        },
        limit: 1,
        depth: 1,
      })

      if (existingBooking.docs.length > 0) {
        const existing = existingBooking.docs[0]
        const existingDate = new Date(existing.date as string).toLocaleDateString('it-IT', {
          weekday: 'long', day: 'numeric', month: 'long',
        })
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.it'
        const cancelLink = `${baseUrl}/cancella?token=${existing.cancellationToken}`

        return NextResponse.json(
          {
            error: 'already_booked',
            message: `Hai già una prenotazione attiva per ${existingDate} alle ${existing.time}. Annulla quella esistente prima di prenotare.`,
            existingAppointment: {
              date: existingDate,
              time: existing.time,
              cancellationLink: cancelLink,
            },
          },
          { status: 400 }
        )
      }
    }

    // --- Validazione giorni chiusi (server-side) ---
    const closedDaysResult = await payload.find({ collection: 'closed-days', limit: 100 })
    const closedDays = closedDaysResult.docs.map((d) => ({
      id: String(d.id),
      date: d.date as string,
      type: d.type as 'holiday' | 'vacation' | 'special',
      reason: d.reason as string | undefined,
      recurring: Boolean(d.recurring),
    }))
    if (isDateClosed(new Date(date + 'T00:00:00'), closedDays)) {
      return NextResponse.json(
        { error: 'date_closed', message: 'Siamo chiusi in questa data.' },
        { status: 400 }
      )
    }

    // --- Validazione anti-conflitto slot ---
    // Fetch all appointments for this date (non-cancelled)
    const existingAppointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          ...dateRangeQuery(date),
          { status: { not_equals: 'cancelled' } },
        ],
      },
      depth: 1,
      limit: 100,
    })

    // Build appointment list for overlap check
    const bookedSlots = existingAppointments.docs.map((apt) => ({
      time: apt.time as string,
      duration: (typeof apt.service === 'object' && apt.service ? (apt.service as { duration?: number }).duration : null) || 45,
      date: date,
      barberId: 'cosimo',
    }))

    // Get closing time for the day (from CMS or defaults)
    const openingHours = await getOpeningHours(payload)
    const dateObj = new Date(date + 'T00:00:00')
    const dayOfWeek = dateObj.getDay()
    const dayHours = openingHours.find((h) => h.dayOfWeek === dayOfWeek)
    const closeTime = dayHours?.closeTime || '19:30'

    // Check if slot is available (using existing isSlotAvailable logic)
    if (!isSlotAvailable(time, serviceDuration, bookedSlots, closeTime)) {
      return NextResponse.json(
        {
          error: 'slot_conflict',
          message: 'Questo orario è già prenotato. Scegli un altro orario.',
        },
        { status: 409 }
      )
    }

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
        status: 'confirmed',
      },
    })

    // --- Race condition mitigation: re-check after create ---
    const recheck = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          ...dateRangeQuery(date),
          { time: { equals: time } },
          { status: { not_equals: 'cancelled' } },
          { id: { not_equals: appointment.id } },
        ],
      },
      limit: 1,
    })
    if (recheck.docs.length > 0) {
      // Conflict detected - rollback
      await payload.delete({ collection: 'appointments', id: appointment.id })
      return NextResponse.json(
        { error: 'slot_conflict', message: 'Slot appena occupato da qualcun altro. Riprova.' },
        { status: 409 }
      )
    }

    // --- Emit SSE event for real-time notifications ---
    bookingEvents.emit('new_booking', {
      appointmentId: appointment.id,
      clientName,
      serviceName: serviceDoc?.name || 'Servizio',
      date,
      time,
    })

    // Send confirmation email via N8N webhook (only if email provided)
    let emailSent = false
    if (clientEmail) {
      emailSent = await sendBookingNotification({
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

      if (emailSent) {
        await payload.update({
          collection: 'appointments',
          id: appointment.id,
          data: { confirmationSent: true },
        })
      }
    }

    // Build cancellation and WhatsApp links
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.it'
    const cancellationLink = `${baseUrl}/cancella?token=${appointment.cancellationToken}`
    const formattedDate = new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    // --- FASE 7: Link cancellazione nel WhatsApp ---
    const whatsappText = encodeURIComponent(
      `Ciao! Ho prenotato un appuntamento da Barber 99:\n` +
      `Servizio: ${serviceDoc?.name || 'Servizio'}\n` +
      `Data: ${formattedDate}\n` +
      `Ora: ${time}\n` +
      `Nome: ${clientName}\n\n` +
      `Per annullare: ${cancellationLink}`
    )
    const whatsappNumber = process.env.WHATSAPP_PHONE || '393271263091'
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappText}`

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

    // Fetch appointments for the date (use range to handle ISO timezone)
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          ...dateRangeQuery(date),
          { status: { not_equals: 'cancelled' } },
        ],
      },
      depth: 1,
    })

    // Return simplified slot data (for availability checking)
    const bookedSlots = appointments.docs.map((apt) => ({
      time: apt.time,
      duration: (typeof apt.service === 'object' && apt.service?.duration) || 45,
      date: date,
      barberId: typeof apt.barber === 'string' ? apt.barber : 'cosimo',
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
