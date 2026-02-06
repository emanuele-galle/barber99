'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Calendar, Clock, Scissors, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AppointmentInfo {
  clientName: string
  date: string
  time: string
  service: string
  status: string
}

function CancelContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Link non valido')
      setLoading(false)
      return
    }

    fetch(`/api/appointments/cancel?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setAppointment(data)
          if (data.status === 'cancelled') setCancelled(true)
        }
      })
      .catch(() => setError('Errore di connessione'))
      .finally(() => setLoading(false))
  }, [token])

  const handleCancel = async () => {
    if (!token) return
    setCancelling(true)
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.success) {
        setCancelled(true)
      } else {
        setError(data.error || 'Errore durante la cancellazione')
      }
    } catch {
      setError('Errore di connessione')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            Barber 99
          </h1>
        </div>

        <div className="bg-[#151515] rounded-xl p-6 border border-white/10">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#d4a855] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60 mt-4">Caricamento...</p>
            </div>
          ) : error && !appointment ? (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Errore</p>
              <p className="text-white/60">{error}</p>
            </div>
          ) : cancelled ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Prenotazione Cancellata</p>
              <p className="text-white/60 mb-6">La tua prenotazione è stata cancellata con successo.</p>
              <Link
                href="/prenota"
                className="inline-block px-6 py-3 bg-[#d4a855] text-[#0c0c0c] rounded-lg font-semibold hover:bg-[#e8c882] transition-colors"
              >
                Prenota di Nuovo
              </Link>
            </div>
          ) : appointment ? (
            <>
              <div className="text-center mb-6">
                <AlertTriangle className="w-12 h-12 text-[#d4a855] mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white">Cancella Prenotazione</h2>
                <p className="text-white/60 mt-2">Sei sicuro di voler cancellare?</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="w-5 h-5 text-[#d4a855]" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Clock className="w-5 h-5 text-[#d4a855]" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Scissors className="w-5 h-5 text-[#d4a855]" />
                  <span>{appointment.service}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 py-3.5 rounded-lg border border-white/20 text-white text-center font-medium hover:bg-white/5 transition-colors"
                >
                  Torna Indietro
                </Link>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancellando...' : 'Cancella Prenotazione'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function CancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  )
}
