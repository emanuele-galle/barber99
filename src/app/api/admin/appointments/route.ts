import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to parameters required' }, { status: 400 })
    }

    const appointments = await payload.find({
      collection: 'appointments',
      sort: 'date',
      limit: 200,
      depth: 2,
      where: {
        and: [
          { date: { greater_than_equal: `${from}T00:00:00.000Z` } },
          { date: { less_than_equal: `${to}T23:59:59.999Z` } },
        ],
      },
    })

    const serialized = appointments.docs.map((apt) => ({
      id: String(apt.id),
      clientName: apt.clientName as string,
      clientEmail: apt.clientEmail as string,
      clientPhone: apt.clientPhone as string,
      date: apt.date as string,
      time: apt.time as string,
      status: apt.status as string,
      notes: apt.notes as string | undefined,
      service: apt.service
        ? {
            name: (apt.service as { name?: string }).name || 'Servizio',
            duration: (apt.service as { duration?: number }).duration,
          }
        : null,
      barber: (apt.barber as string) || 'Cosimo Pisani',
    }))

    const response = NextResponse.json({
      appointments: serialized,
      total: appointments.totalDocs,
    })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  } catch (error) {
    console.error('Error fetching admin appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}
