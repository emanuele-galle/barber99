export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Clock, CalendarX, ChevronRight } from 'lucide-react'
import { OpeningHoursForm } from '@/components/admin-panel/OpeningHoursForm'

async function getOpeningHours() {
  const payload = await getPayload({ config })
  const hours = await payload.find({
    collection: 'opening-hours',
    sort: 'dayOfWeek',
    limit: 10,
  })
  return hours.docs
}

const dayNameToNumber: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
}

const dayLabels: Record<number, string> = {
  0: 'Domenica',
  1: 'Lunedì',
  2: 'Martedì',
  3: 'Mercoledì',
  4: 'Giovedì',
  5: 'Venerdì',
  6: 'Sabato',
}

export default async function OrariPage() {
  const hours = await getOpeningHours()

  // Create a map of existing hours (dayOfWeek in DB is a string like 'monday')
  const hoursMap = hours.reduce((acc, h) => {
    const dayNum = dayNameToNumber[h.dayOfWeek as string]
    if (dayNum !== undefined) acc[dayNum] = h
    return acc
  }, {} as Record<number, typeof hours[0]>)

  // Ensure all days are represented
  const allDays = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    dayOfWeek: day,
    dayName: dayLabels[day],
    data: hoursMap[day] || null,
  }))

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orari di Apertura</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          Gestisci gli orari del salone
        </p>
      </div>

      {/* Closed Days Link */}
      <Link
        href="/admin-panel/orari/chiusure"
        className="admin-card p-4 flex items-center justify-between hover:border-[rgba(212,168,85,0.3)] transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
            <CalendarX className="w-6 h-6 text-[#d4a855]" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Giorni di Chiusura</h2>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">
              Gestisci ferie, festivi e chiusure speciali
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.3)] group-hover:text-[#d4a855] transition-colors" />
      </Link>

      {/* Hours form */}
      <div className="admin-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#d4a855]" />
          Orari Settimanali
        </h2>
        <div className="space-y-4">
          {allDays.map((day) => (
            <div
              key={day.dayOfWeek}
              className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-[rgba(255,255,255,0.05)] last:border-0"
            >
              {/* Day name */}
              <div className="sm:w-32 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4a855]" />
                <span className="font-medium text-white">{day.dayName}</span>
              </div>

              {/* Hours form */}
              <OpeningHoursForm
                dayOfWeek={day.dayOfWeek}
                existingData={day.data ? {
                  id: String(day.data.id),
                  isOpen: !day.data.isClosed as boolean,
                  openTime: day.data.openTime as string,
                  closeTime: day.data.closeTime as string,
                  breakStart: day.data.breakStart as string | undefined,
                  breakEnd: day.data.breakEnd as string | undefined,
                } : null}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
