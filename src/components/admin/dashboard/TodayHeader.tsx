'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface NextAppointment {
  id: string
  clientName: string
  time: string
  serviceName: string
  serviceDuration: number
}

interface TodayHeaderProps {
  nextAppointment?: NextAppointment | null
}

export function TodayHeader({ nextAppointment }: TodayHeaderProps) {
  const today = new Date()
  const formattedDate = today.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Calcola minuti mancanti al prossimo appuntamento
  const [minutesUntilNext, setMinutesUntilNext] = useState<number | null>(null)
  useEffect(() => {
    if (!nextAppointment) {
      requestAnimationFrame(() => setMinutesUntilNext(null))
      return
    }
    const calculate = () => {
      const [hours, minutes] = nextAppointment.time.split(':').map(Number)
      const appointmentTime = new Date()
      appointmentTime.setHours(hours, minutes, 0, 0)
      const diff = appointmentTime.getTime() - Date.now()
      requestAnimationFrame(() => setMinutesUntilNext(Math.max(0, Math.floor(diff / 60000))))
    }
    calculate()
    const interval = setInterval(calculate, 60000)
    return () => clearInterval(interval)
  }, [nextAppointment])

  return (
    <div className="admin-card p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(212,168,85,0.1)] to-transparent" />

      <div className="relative z-10">
        {/* Date row */}
        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.6)] mb-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider">Oggi</span>
        </div>

        <h1 className="text-2xl font-bold text-white capitalize mb-4">
          {formattedDate}
        </h1>

        {/* Next appointment */}
        {nextAppointment ? (
          <Link
            href={`/admin-panel/appuntamenti`}
            className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(212,168,85,0.1)] border border-[rgba(212,168,85,0.2)] hover:border-[#d4a855] transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#d4a855] flex items-center justify-center">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#d4a855] font-medium">Prossimo appuntamento</p>
              <p className="text-lg text-white font-semibold">
                {nextAppointment.clientName} alle {nextAppointment.time}
              </p>
              <p className="text-sm text-[rgba(255,255,255,0.5)]">
                {nextAppointment.serviceName} ({nextAppointment.serviceDuration} min)
              </p>
            </div>
            {minutesUntilNext !== null && minutesUntilNext > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-[#d4a855]">{minutesUntilNext}</p>
                <p className="text-xs text-[rgba(255,255,255,0.5)]">minuti</p>
              </div>
            )}
            <ArrowRight className="w-5 h-5 text-[rgba(255,255,255,0.3)] group-hover:text-[#d4a855] transition-colors" />
          </Link>
        ) : (
          <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
            <p className="text-[rgba(255,255,255,0.5)] text-center">
              Nessun appuntamento in programma per oggi
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
