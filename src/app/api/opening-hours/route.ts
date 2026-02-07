import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { defaultOpeningHours } from '@/lib/booking'

const dayNameToNumber: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
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

      return NextResponse.json({ openingHours })
    }

    // Fallback to defaults if collection is empty
    return NextResponse.json({ openingHours: defaultOpeningHours })
  } catch (error) {
    console.error('Error fetching opening hours:', error)
    return NextResponse.json({ openingHours: defaultOpeningHours })
  }
}
