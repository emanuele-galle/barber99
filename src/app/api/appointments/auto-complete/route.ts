import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const SYNC_SECRET = process.env.INSTAGRAM_SYNC_SECRET

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- Batch auto-complete with time-based logic
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-sync-secret')
    if (!SYNC_SECRET || secret !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    // Find all confirmed/pending appointments up to today
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          { status: { in: ['confirmed', 'pending'] } },
          { date: { less_than_equal: `${todayStr}T23:59:59.999Z` } },
        ],
      },
      depth: 1,
      limit: 500,
    })

    let completed = 0
    let errors = 0

    for (const apt of appointments.docs) {
      const aptDate = new Date(apt.date as string).toISOString().split('T')[0]

      let shouldComplete = false

      // Past dates: complete all
      if (aptDate < todayStr) {
        shouldComplete = true
      }

      // Today: check if appointment end time has passed
      if (aptDate === todayStr && apt.time) {
        const startMinutes = timeToMinutes(apt.time as string)
        let duration = 45
        if (apt.service && typeof apt.service === 'object' && apt.service.duration) {
          duration = apt.service.duration
        }
        const endMinutes = startMinutes + duration
        if (endMinutes <= currentMinutes) {
          shouldComplete = true
        }
      }

      if (shouldComplete) {
        try {
          await payload.update({
            collection: 'appointments',
            id: apt.id,
            data: { status: 'completed' },
          })
          completed++
        } catch (err) {
          console.error(`Auto-complete failed for appointment ${apt.id}:`, err)
          errors++
        }
      }
    }

    return NextResponse.json({
      completed,
      errors,
      total: appointments.docs.length,
      date: todayStr,
      currentTime: `${Math.floor(currentMinutes / 60)}:${String(currentMinutes % 60).padStart(2, '0')}`,
    })
  } catch (error) {
    console.error('Auto-complete error:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}
