import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isSlotAvailable } from '@/lib/booking'
import { bookingEvents } from '@/lib/booking-events'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'
import { reverseClientStats } from '@/lib/reverse-client-stats'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

// eslint-disable-next-line sonarjs/cognitive-complexity -- API route with status transitions, notifications, client stats
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body = await request.json()

    // Auth check - only admin can update appointments
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'noshow']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // --- FASE 5: Validazione conflitti se cambiano date/time ---
    // Skip validation for terminal statuses (cancel, complete, noshow) - no slot check needed
    const isTerminalStatus = ['cancelled', 'completed', 'noshow'].includes(body.status)
    if ((body.date || body.time) && !isTerminalStatus) {
      // Get current appointment data
      const current = await payload.findByID({ collection: 'appointments', id, depth: 1 })
      const newDate = body.date || current.date
      const newTime = body.time || current.time

      // Get service duration
      let serviceDuration = 45
      const serviceRef = body.service || current.service
      if (serviceRef) {
        if (typeof serviceRef === 'object' && serviceRef.duration) {
          serviceDuration = serviceRef.duration
        } else {
          try {
            const svc = await payload.findByID({ collection: 'services', id: typeof serviceRef === 'string' ? serviceRef : serviceRef.id })
            serviceDuration = svc?.duration || 45
          } catch { /* keep default */ }
        }
      }

      // Fetch existing appointments for the new date, excluding current
      const dateStr = typeof newDate === 'string' && newDate.includes('T') ? newDate.split('T')[0] : newDate
      const existingAppointments = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            { date: { greater_than_equal: `${dateStr}T00:00:00.000Z` } },
            { date: { less_than_equal: `${dateStr}T23:59:59.999Z` } },
            { status: { not_equals: 'cancelled' } },
            { id: { not_equals: id } },
          ],
        },
        depth: 1,
        limit: 100,
      })

      const bookedSlots = existingAppointments.docs.map((apt) => ({
        time: apt.time as string,
        duration: typeof apt.service === 'object' && apt.service ? (apt.service as { duration?: number }).duration || 45 : 45,
        date: dateStr as string,
        barberId: 'cosimo',
      }))

      // Fetch opening hours from CMS (same as POST handler)
      const dayNameToNumber: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      }
      let closeTime = '19:30'
      try {
        const hoursResult = await payload.find({ collection: 'opening-hours', limit: 7 })
        if (hoursResult.docs.length > 0) {
          const dateObj = new Date(dateStr + 'T00:00:00')
          const dayOfWeek = dateObj.getDay()
          const dayDoc = hoursResult.docs.find((h) => dayNameToNumber[h.dayOfWeek as string] === dayOfWeek)
          if (dayDoc) {
            closeTime = (dayDoc.closeTime as string) || '19:30'
          }
        }
      } catch { /* keep default */ }

      if (!isSlotAvailable(newTime as string, serviceDuration, bookedSlots, closeTime)) {
        return NextResponse.json(
          {
            error: 'slot_conflict',
            message: 'Il nuovo orario è già occupato. Scegli un altro orario.',
          },
          { status: 409 }
        )
      }
    }

    // Whitelist allowed fields to prevent mass-assignment
    const allowedFields = ['status', 'date', 'time', 'service', 'clientName', 'clientEmail', 'clientPhone', 'notes', 'barber', 'type'] as const
    const filteredData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        filteredData[field] = body[field]
      }
    }
    // Normalize date to UTC noon if it's a bare YYYY-MM-DD string
    if (filteredData.date && typeof filteredData.date === 'string' && !String(filteredData.date).includes('T')) {
      filteredData.date = `${filteredData.date}T12:00:00.000Z`
    }

    // Update appointment
    const updated = await payload.update({
      collection: 'appointments',
      id,
      data: filteredData,
    })

    // Emit SSE event for real-time admin notification on modifications
    if (body.date || body.time) {
      const svcName = typeof updated.service === 'object' && updated.service
        ? (updated.service as { name?: string }).name || 'Servizio'
        : 'Servizio'
      const dStr = typeof updated.date === 'string' && updated.date.includes('T')
        ? updated.date.split('T')[0]
        : String(updated.date)
      const dFmt = new Date(dStr + 'T00:00:00').toLocaleDateString('it-IT', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      bookingEvents.emit('modification', {
        appointmentId: id,
        clientName: updated.clientName,
        serviceName: svcName,
        date: dFmt,
        time: updated.time,
      })
    }

    // Send cancellation notification email when admin cancels
    if (body.status === 'cancelled' && updated.clientEmail) {
      const svcName = typeof updated.service === 'object' && updated.service
        ? (updated.service as { name?: string }).name || 'Servizio'
        : 'Servizio'
      const cDateStr = typeof updated.date === 'string' && updated.date.includes('T')
        ? updated.date.split('T')[0]
        : String(updated.date)
      const cDateFmt = new Date(cDateStr + 'T00:00:00').toLocaleDateString('it-IT', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      bookingEvents.emit('cancellation', {
        appointmentId: id,
        clientName: updated.clientName,
        serviceName: svcName,
        date: cDateFmt,
        time: updated.time,
      })
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'cancellation',
            client_name: updated.clientName,
            client_email: updated.clientEmail,
            client_phone: updated.clientPhone,
            service_name: svcName,
            date: cDateFmt,
            time: updated.time,
            reason: 'Cancellato dall\'amministratore',
          }),
        })
      } catch (e) {
        console.error('Failed to send cancellation notification:', e)
      }
    }

    // Send modification notification email (only if date/time changed and client has email)
    if ((body.date || body.time) && updated.clientEmail) {
      const serviceName = typeof updated.service === 'object' && updated.service
        ? (updated.service as { name?: string }).name || 'Servizio'
        : 'Servizio'
      const dateStr = typeof updated.date === 'string' && updated.date.includes('T')
        ? updated.date.split('T')[0]
        : String(updated.date)
      const dateFormatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'modification',
            client_name: updated.clientName,
            client_email: updated.clientEmail,
            client_phone: updated.clientPhone,
            service_name: serviceName,
            date: dateFormatted,
            time: updated.time,
            cancellationLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.it'}/cancella?token=${updated.cancellationToken}`,
          }),
        })
      } catch (e) {
        console.error('Failed to send modification notification:', e)
      }
    }

    return NextResponse.json({
      success: true,
      appointment: updated,
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

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

    // Auth: allow admin OR valid cancellation token
    const user = await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!user && token !== appointment.cancellationToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Feature flag check
    if (process.env.ENABLE_DELETE_PAST !== 'true') {
      return NextResponse.json(
        { error: 'Funzionalità non abilitata' },
        { status: 403 }
      )
    }

    const payload = await getPayload({ config })
    const { id } = await params

    // Auth check
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch appointment with depth 2 (service.price + client stats)
    const appointment = await payload.findByID({
      collection: 'appointments',
      id,
      depth: 2,
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appuntamento non trovato' },
        { status: 404 }
      )
    }

    // Validate past-only
    const aptDate = new Date(appointment.date as string)
    aptDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (aptDate >= today) {
      return NextResponse.json(
        { error: 'Solo appuntamenti passati possono essere eliminati' },
        { status: 400 }
      )
    }

    // Audit log
    console.log('[DELETE-APPOINTMENT]', JSON.stringify({
      id: appointment.id,
      clientName: appointment.clientName,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      service: typeof appointment.service === 'object' && appointment.service
        ? { id: (appointment.service as { id: string }).id, name: (appointment.service as { name?: string }).name, price: (appointment.service as { price?: number }).price }
        : appointment.service,
    }))

    // Reverse client statistics
    try {
      await reverseClientStats(payload, appointment as Parameters<typeof reverseClientStats>[1])
    } catch (e) {
      console.error('Error reversing client stats:', e)
    }

    // Delete
    await payload.delete({
      collection: 'appointments',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Appuntamento eliminato',
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
