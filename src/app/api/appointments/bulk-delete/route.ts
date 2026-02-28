import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/admin-auth'
import { reverseClientStats } from '@/lib/reverse-client-stats'

// eslint-disable-next-line sonarjs/cognitive-complexity -- Bulk delete with auth, validation, stats reversal
export async function POST(request: NextRequest) {
  try {
    // Feature flag check
    if (process.env.ENABLE_DELETE_PAST !== 'true') {
      return NextResponse.json(
        { error: 'Funzionalità non abilitata' },
        { status: 403 }
      )
    }

    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ids: string[] = body.ids

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array richiesto' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let deleted = 0
    const errors: string[] = []

    for (const id of ids) {
      try {
        const appointment = await payload.findByID({
          collection: 'appointments',
          id,
          depth: 2,
        })

        if (!appointment) {
          errors.push(`${id}: non trovato`)
          continue
        }

        // Validate past-only
        const aptDate = new Date(appointment.date as string)
        aptDate.setHours(0, 0, 0, 0)
        if (aptDate >= today) {
          errors.push(`${id}: non è un appuntamento passato`)
          continue
        }

        // Audit log
        console.log('[BULK-DELETE-APPOINTMENT]', JSON.stringify({
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
          console.error(`Error reversing stats for ${id}:`, e)
        }

        await payload.delete({ collection: 'appointments', id })
        deleted++
      } catch (e) {
        errors.push(`${id}: ${e instanceof Error ? e.message : 'errore sconosciuto'}`)
      }
    }

    return NextResponse.json({ success: true, deleted, errors })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json(
      { error: 'Failed to bulk delete appointments' },
      { status: 500 }
    )
  }
}
