'use client'

import { AlertCircle, Check, X, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

interface PendingAppointment {
  id: string
  clientName: string
  clientPhone?: string
  date: string
  time: string
  serviceName: string
}

interface PendingConfirmationsProps {
  appointments: PendingAppointment[]
}

export function PendingConfirmations({ appointments }: PendingConfirmationsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Domani'
    } else {
      return date.toLocaleDateString('it-IT', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    }
  }

  const handleConfirm = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      showToast('success', 'Appuntamento confermato', 'Confermato')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante la conferma', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      showToast('success', 'Appuntamento annullato', 'Annullato')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante annullamento', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  if (appointments.length === 0) {
    return null
  }

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Da Confermare
          <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">
            {appointments.length}
          </span>
        </h3>
        <Link
          href="/admin-panel/appuntamenti?status=pending"
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
            className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-yellow-500/30 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">
                  {apt.clientName}
                </p>
                <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                  {formatDate(apt.date)}
                </span>
              </div>
              <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
                {apt.time} - {apt.serviceName}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {apt.clientPhone && (
                <a
                  href={`tel:${apt.clientPhone}`}
                  className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-blue-500/20 text-[rgba(255,255,255,0.5)] hover:text-blue-400 transition-all"
                  title="Chiama"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => handleConfirm(apt.id)}
                disabled={loading === apt.id}
                className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all disabled:opacity-50"
                title="Conferma"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancel(apt.id)}
                disabled={loading === apt.id}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all disabled:opacity-50"
                title="Annulla"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {appointments.length > 5 && (
        <Link
          href="/admin-panel/appuntamenti?status=pending"
          className="mt-4 block text-center text-sm text-[rgba(255,255,255,0.5)] hover:text-[#d4a855]"
        >
          +{appointments.length - 5} altri da confermare
        </Link>
      )}
    </div>
  )
}
