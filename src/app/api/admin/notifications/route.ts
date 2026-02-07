import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { user } = await payload.auth({
      headers: new Headers({ Cookie: `payload-token=${token}` }),
    })
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    const [appointmentsResult, contactsResult] = await Promise.all([
      payload.find({
        collection: 'appointments',
        where: {
          status: { equals: 'confirmed' },
          date: {
            greater_than_equal: today.toISOString(),
            less_than: tomorrow.toISOString(),
          },
        },
        depth: 1,
        limit: 50,
      }),
      payload.count({
        collection: 'contact-submissions',
        where: {
          status: { equals: 'new' },
        },
      }),
    ])

    const imminent = appointmentsResult.docs.filter((apt) => {
      const [hours, minutes] = (apt.time as string).split(':').map(Number)
      const aptTime = new Date(today)
      aptTime.setHours(hours, minutes, 0, 0)
      return aptTime >= now && aptTime <= twoHoursFromNow
    }).map((apt) => ({
      id: apt.id,
      clientName: apt.clientName,
      time: apt.time,
      serviceName: typeof apt.service === 'object' && apt.service ? (apt.service as { name?: string }).name : undefined,
    }))

    return NextResponse.json({
      imminent,
      unreadContacts: contactsResult.totalDocs,
    })
  } catch (error) {
    console.error('Error fetching admin notifications:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
