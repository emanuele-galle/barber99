import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { defaultOpeningHours } from '@/lib/booking'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

const dayNameToNumber: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

const dayNumberToName: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
}

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({ collection: 'opening-hours', limit: 7 })

    if (result.docs.length > 0) {
      const openingHours = result.docs.map((h) => ({
        dayOfWeek: dayNameToNumber[h.dayOfWeek as string] ?? 0,
        openTime: (h.openTime as string) || '09:00',
        closeTime: (h.closeTime as string) || '19:30',
        isClosed: Boolean(h.isClosed),
        breakStart: (h.breakStart as string) || undefined,
        breakEnd: (h.breakEnd as string) || undefined,
      }))

      const response = NextResponse.json({ openingHours })
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      return response
    }

    // Fallback to defaults if collection is empty
    const response = NextResponse.json({ openingHours: defaultOpeningHours })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  } catch (error) {
    console.error('Error fetching opening hours:', error)
    return NextResponse.json({ openingHours: defaultOpeningHours })
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const dayName = dayNumberToName[body.dayOfWeek]
    if (!dayName) {
      return NextResponse.json({ error: 'Invalid dayOfWeek' }, { status: 400 })
    }

    const doc = await payload.create({
      collection: 'opening-hours',
      data: {
        dayOfWeek: dayName,
        isClosed: body.isClosed ?? false,
        openTime: body.openTime || '09:00',
        closeTime: body.closeTime || '19:30',
        breakStart: body.breakStart || null,
        breakEnd: body.breakEnd || null,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Error creating opening hours:', error)
    return NextResponse.json({ error: 'Failed to create opening hours' }, { status: 500 })
  }
}
