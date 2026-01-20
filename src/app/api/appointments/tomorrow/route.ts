import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Calculate tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    // Fetch appointments for tomorrow
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          {
            date: {
              greater_than_equal: tomorrow.toISOString(),
            },
          },
          {
            date: {
              less_than_equal: tomorrowEnd.toISOString(),
            },
          },
          {
            status: {
              equals: 'confirmed',
            },
          },
        ],
      },
      depth: 2,
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      date: tomorrow.toISOString().split('T')[0],
      appointments: appointments.docs,
    })
  } catch (error) {
    console.error('Error fetching tomorrow appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
