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

    // Find all appointments for this client
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        client: { equals: id },
      },
      sort: '-date',
      depth: 1, // Include service and barber details
      limit: 100,
    })

    return NextResponse.json({
      appointments: appointments.docs.map((apt) => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        service: apt.service
          ? {
              name: typeof apt.service === 'object' ? apt.service.name : null,
              price: typeof apt.service === 'object' ? apt.service.price : null,
              duration: typeof apt.service === 'object' ? apt.service.duration : null,
            }
          : null,
        barber: apt.barber
          ? {
              name: typeof apt.barber === 'object' ? apt.barber.name : null,
            }
          : null,
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
