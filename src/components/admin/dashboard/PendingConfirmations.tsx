'use client'

import { Clock, Phone, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

interface UpcomingAppointment {
  id: string
  clientName: string
  clientPhone?: string
  time: string
  serviceName: string
}

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleComplete = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      showToast('success', 'Appuntamento completato', 'Completato')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante aggiornamento', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  if (appointments.length === 0) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-[#d4a855]" />
          In Arrivo Oggi
        </h3>
        <p className="text-sm text-[rgba(255,255,255,0.5)]">Nessun appuntamento in arrivo</p>
      </div>
    )
  }

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#d4a855]" />
          In Arrivo Oggi
          <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-[#d4a855]/20 text-[#d4a855]">
            {appointments.length}
          </span>
        </h3>
        <Link
          href="/admin-panel/appuntamenti"
          className="text-sm text-[#d4a855] hover:text-[#e8c882] flex items-center gap-1"
        >
          Vedi tutti
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {appointments.slice(0, 5).map((apt) => (
          <div
            key={apt.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#d4a855]/30 transition-all"
          >
            <div className="w-12 h-12 rounded-lg bg-[#d4a855]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#d4a855]">{apt.time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {apt.clientName}
              </p>
              <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
                {apt.serviceName}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {apt.clientPhone && (
                <>
                  <a
                    href={`tel:${apt.clientPhone}`}
                    className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-blue-500/20 text-[rgba(255,255,255,0.5)] hover:text-blue-400 transition-all"
                    title="Chiama"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </>
              )}
              <button
                onClick={() => handleComplete(apt.id)}
                disabled={loading === apt.id}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all disabled:opacity-50"
                title="Completa"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {appointments.length > 5 && (
        <Link
          href="/admin-panel/appuntamenti"
          className="mt-4 block text-center text-sm text-[rgba(255,255,255,0.5)] hover:text-[#d4a855]"
        >
          +{appointments.length - 5} altri in arrivo
        </Link>
      )}
    </div>
  )
}

