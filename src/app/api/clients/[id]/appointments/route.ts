import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getClientFromCookie } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tokenPayload = await getClientFromCookie()

    // Verify that the requesting client matches the requested ID
    if (!tokenPayload || tokenPayload.clientId !== id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const payload = await getPayload({ config })

    // Fetch client record to get email and phone for fallback matching
    const client = await payload.findByID({
      collection: 'clients',
      id,
    })

    // Build query: linked by relationship OR matching email/phone (orphan appointments)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orConditions: any[] = [
      { client: { equals: id } },
    ]

    if (client.email) {
      orConditions.push({
        and: [
          { clientEmail: { equals: client.email } },
          { client: { exists: false } },
        ],
      })
    }

    if (client.phone) {
      orConditions.push({
        and: [
          { clientPhone: { equals: client.phone } },
          { client: { exists: false } },
        ],
      })
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        or: orConditions,
      },
      sort: '-date',
      depth: 1,
      limit: 100,
    })

    // Retroactively link any orphan appointments found by email/phone
    const numericId = Number(id)
    const orphans = appointments.docs.filter(
      (apt) => !apt.client || (typeof apt.client === 'object' ? String(apt.client.id) !== id : String(apt.client) !== id)
    )
    if (orphans.length > 0) {
      await Promise.all(
        orphans.map((apt) =>
          payload.update({
            collection: 'appointments',
            id: apt.id,
            data: { client: numericId },
          }).catch((err) => console.error(`Failed to link orphan appointment ${apt.id}:`, err))
        )
      )
    }

    return NextResponse.json({
      appointments: appointments.docs.map((apt) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        cancellationToken: apt.cancellationToken || null,
        service: apt.service
          ? {
              name: typeof apt.service === 'object' ? apt.service.name : null,
              price: typeof apt.service === 'object' ? apt.service.price : null,
              duration: typeof apt.service === 'object' ? apt.service.duration : null,
            }
          : null,
        barber: typeof apt.barber === 'string' ? apt.barber : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching client appointments:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero degli appuntamenti' },
      { status: 500 }
    )
  }
}
