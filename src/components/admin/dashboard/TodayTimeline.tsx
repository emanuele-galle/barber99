'use client'

import { CheckCircle, Clock, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface TimelineAppointment {
  id: string
  time: string
  clientName: string
  serviceName: string
  serviceDuration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow'
  barberName?: string
}

interface TodayTimelineProps {
  appointments: TimelineAppointment[]
  openingTime?: string
  closingTime?: string
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-500/20 border-yellow-500/30',
    textColor: 'text-yellow-400',
    icon: AlertCircle,
    label: 'Da confermare',
  },
  confirmed: {
    color: 'bg-[#d4a855]/20 border-[#d4a855]/30',
    textColor: 'text-[#d4a855]',
    icon: Clock,
    label: 'Confermato',
  },
  completed: {
    color: 'bg-green-500/20 border-green-500/30',
    textColor: 'text-green-400',
    icon: CheckCircle,
    label: 'Completato',
  },
  cancelled: {
    color: 'bg-red-500/10 border-red-500/20 opacity-50',
    textColor: 'text-red-400',
    icon: AlertCircle,
    label: 'Annullato',
  },
  noshow: {
    color: 'bg-orange-500/10 border-orange-500/20 opacity-50',
    textColor: 'text-orange-400',
    icon: User,
    label: 'No Show',
  },
}

export function TodayTimeline({
  appointments,
  openingTime = '09:00',
  closingTime = '19:00',
}: TodayTimelineProps) {
  // Genera gli slot orari
  const generateTimeSlots = () => {
    const slots: string[] = []
    const [startHour] = openingTime.split(':').map(Number)
    const [endHour] = closingTime.split(':').map(Number)

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // Mappa gli appuntamenti per slot orario
  const appointmentsByTime = new Map<string, TimelineAppointment>()
  appointments.forEach((apt) => {
    appointmentsByTime.set(apt.time, apt)
  })

  // Determina se uno slot è passato
  const isSlotPassed = (slotTime: string): boolean => {
    return slotTime < currentTime
  }

  // Determina se uno slot è l'attuale o il prossimo
  const isCurrentSlot = (slotTime: string, index: number): boolean => {
    const nextSlot = timeSlots[index + 1]
    return slotTime <= currentTime && (!nextSlot || currentTime < nextSlot)
  }

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#d4a855]" />
          Timeline Oggi
        </h3>
        <Link
          href="/admin-panel/appuntamenti"
          className="text-sm text-[#d4a855] hover:text-[#e8c882]"
        >
          Gestisci
        </Link>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {timeSlots.map((slot, index) => {
          const appointment = appointmentsByTime.get(slot)
          const passed = isSlotPassed(slot)
          const current = isCurrentSlot(slot, index)

          return (
            <div
              key={slot}
              className={`flex items-center gap-3 py-2 transition-all ${
                current ? 'scale-[1.02]' : ''
              } ${passed && !appointment ? 'opacity-40' : ''}`}
            >
              {/* Time */}
              <div
                className={`w-14 text-sm font-mono ${
                  current
                    ? 'text-[#d4a855] font-bold'
                    : passed
                      ? 'text-[rgba(255,255,255,0.3)]'
                      : 'text-[rgba(255,255,255,0.6)]'
                }`}
              >
                {slot}
              </div>

              {/* Current time indicator */}
              {current && (
                <div className="w-2 h-2 rounded-full bg-[#d4a855] animate-pulse" />
              )}
              {!current && <div className="w-2" />}

              {/* Appointment or free slot */}
              {appointment ? (
                <Link
                  href={`/admin-panel/appuntamenti`}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01] ${statusConfig[appointment.status].color}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {appointment.clientName}
                      </p>
                      {(() => {
                        const StatusIcon = statusConfig[appointment.status].icon
                        return (
                          <StatusIcon
                            className={`w-4 h-4 ${statusConfig[appointment.status].textColor}`}
                          />
                        )
                      })()}
                    </div>
                    <p className="text-xs text-[rgba(255,255,255,0.5)]">
                      {appointment.serviceName}
                      {appointment.barberName && ` • ${appointment.barberName}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs ${statusConfig[appointment.status].textColor}`}
                  >
                    {appointment.serviceDuration} min
                  </span>
                </Link>
              ) : (
                <div
                  className={`flex-1 h-10 rounded-lg border border-dashed ${
                    passed
                      ? 'border-[rgba(255,255,255,0.05)]'
                      : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(212,168,85,0.3)] hover:bg-[rgba(212,168,85,0.05)]'
                  } flex items-center justify-center transition-all`}
                >
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">
                    {passed ? '' : 'Libero'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-8 text-[rgba(255,255,255,0.5)]">
          Nessun appuntamento per oggi
        </div>
      )}
    </div>
  )
}
