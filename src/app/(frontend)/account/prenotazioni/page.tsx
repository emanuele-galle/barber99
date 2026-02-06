'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'
import { ArrowLeft, Loader2, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow'
  service: {
    name: string
    price: number
    duration: number
  }
  barber?: string
}

export default function PrenotazioniPage() {
  const router = useRouter()
  const { client, isLoading, isAuthenticated } = useClientAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (client?.id) {
      fetchAppointments()
    }
  }, [client?.id])

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/clients/${client?.id}/appointments`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingAppointments(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
      case 'noshow':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-[#d4a855]" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa'
      case 'confirmed':
        return 'Confermato'
      case 'completed':
        return 'Completato'
      case 'cancelled':
        return 'Cancellato'
      case 'noshow':
        return 'Non presentato'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Separate upcoming and past appointments
  const now = new Date()
  const upcomingAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(`${a.date}T${a.time}`)
    return appointmentDate >= now && !['cancelled', 'noshow', 'completed'].includes(a.status)
  })
  const pastAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(`${a.date}T${a.time}`)
    return appointmentDate < now || ['cancelled', 'noshow', 'completed'].includes(a.status)
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al tuo account
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Le tue prenotazioni</h1>
          <p className="text-[rgba(255,255,255,0.6)]">
            Visualizza i tuoi appuntamenti passati e futuri
          </p>
        </div>

        {loadingAppointments ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-[rgba(255,255,255,0.3)] mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Nessuna prenotazione</h3>
            <p className="text-[rgba(255,255,255,0.5)] mb-4">
              Non hai ancora effettuato prenotazioni
            </p>
            <Link
              href="/prenota"
              className="inline-block bg-[#d4a855] hover:bg-[#c49745] text-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Prenota ora
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Prossimi appuntamenti</h2>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-[#1a1a1a] border border-[#d4a855]/30 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-medium">{appointment.service?.name}</h3>
                          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.6)] text-sm mt-1">
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#d4a855] font-semibold">
                            {appointment.service?.price?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-[rgba(255,255,255,0.6)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.time}</span>
                        </div>
                        {appointment.barber && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{appointment.barber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Storico</h2>
                <div className="space-y-3">
                  {pastAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 opacity-70"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-medium">{appointment.service?.name}</h3>
                          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.5)] text-sm mt-1">
                            {getStatusIcon(appointment.status)}
                            <span>{getStatusText(appointment.status)}</span>
                          </div>
                        </div>
                        <div className="text-right text-[rgba(255,255,255,0.5)]">
                          {appointment.service?.price?.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-4 text-sm text-[rgba(255,255,255,0.5)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        {appointment.status === 'completed' && appointment.service && (
                          <Link
                            href={`/prenota?service=${encodeURIComponent(appointment.service.name)}`}
                            className="flex items-center gap-1.5 text-[#d4a855] text-sm hover:text-[#e8c882] transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Prenota di nuovo</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
