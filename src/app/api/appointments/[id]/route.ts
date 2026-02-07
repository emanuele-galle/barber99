import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isSlotAvailable, defaultOpeningHours } from '@/lib/booking'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

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
    if (body.date || body.time) {
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
            { date: { equals: dateStr } },
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

      const dateObj = new Date(dateStr + 'T00:00:00')
      const dayOfWeek = dateObj.getDay()
      const dayHours = defaultOpeningHours.find((h) => h.dayOfWeek === dayOfWeek)
      const closeTime = dayHours?.closeTime || '19:30'

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

    // Update appointment
    const updated = await payload.update({
      collection: 'appointments',
      id,
      data: body,
    })

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

    await payload.delete({
      collection: 'appointments',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted',
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
