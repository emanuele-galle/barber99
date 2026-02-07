'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlus,
  Clock,
  Phone,
  CheckCircle,
  Loader2,
  User,
  Scissors,
  PlayCircle,
  Users,
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { EmptyState } from '@/components/admin-panel/EmptyState'

interface WalkinItem {
  id: string
  clientName: string
  clientPhone: string
  serviceName: string
  serviceDuration: number
  barberName?: string
  status: string
  queuePosition: number
  checkedInAt: string
  estimatedWaitMinutes: number
}

interface Service {
  id: string
  name: string
  duration: number
}

interface WalkinQueueProps {
  initialWalkins: WalkinItem[]
  services: Service[]
}

export function WalkinQueue({ initialWalkins, services }: WalkinQueueProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [walkins, setWalkins] = useState(initialWalkins)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [callingNext, setCallingNext] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceId: services[0]?.id || '',
    notes: '',
  })

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  const inQueue = walkins.filter((w) => w.status === 'inqueue')
  const inService = walkins.filter((w) => w.status === 'inservice')

  const handleAddWalkin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientName || !formData.serviceId) {
      showToast('error', 'Nome e servizio sono obbligatori', 'Errore')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      showToast('success', `${formData.clientName} aggiunto alla coda`, 'Cliente aggiunto')
      setFormData({
        clientName: '',
        clientPhone: '',
        serviceId: services[0]?.id || '',
        notes: '',
      })
      setShowForm(false)
      router.refresh()
    } catch {
      showToast('error', 'Errore durante aggiunta cliente', 'Errore')
    } finally {
      setLoading(false)
    }
  }

  const handleCallNext = async () => {
    if (inQueue.length === 0) {
      showToast('warning', 'Nessuno in coda', 'Coda vuota')
      return
    }

    setCallingNext(true)
    try {
      const res = await fetch('/api/walkin/next', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      const data = await res.json()
      showToast('success', `${data.client.clientName} chiamato!`, 'Prossimo cliente')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante chiamata cliente', 'Errore')
    } finally {
      setCallingNext(false)
    }
  }

  const handleComplete = async (id: string, clientName: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')

      showToast('success', `Servizio per ${clientName} completato`, 'Completato')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante completamento', 'Errore')
    }
  }

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `~${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `~${hours}h ${mins}min`
  }

  const formatCheckinTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Senza Appuntamento</h1>
          <p className="text-[rgba(255,255,255,0.5)] mt-1">
            Gestisci i clienti senza prenotazione
          </p>
        </div>

        <div className="flex gap-3">
          {/* Call Next Button */}
          <button
            onClick={handleCallNext}
            disabled={callingNext || inQueue.length === 0}
            className="admin-btn admin-btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {callingNext ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PlayCircle className="w-5 h-5" />
            )}
            Chiama Prossimo
            {inQueue.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-black/20">
                {inQueue.length}
              </span>
            )}
          </button>

          {/* Add Walk-in Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="admin-btn admin-btn-secondary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Aggiungi
          </button>
        </div>
      </div>

      {/* Add Walk-in Form */}
      {showForm && (
        <div className="admin-card p-6 admin-fade-in">
          <h3 className="text-lg font-semibold text-white mb-4">Nuovo Cliente</h3>
          <form onSubmit={handleAddWalkin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[rgba(255,255,255,0.6)] mb-2">
                  Nome Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="admin-input w-full"
                  placeholder="Mario Rossi"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[rgba(255,255,255,0.6)] mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="admin-input w-full"
                  placeholder="+39 333 1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[rgba(255,255,255,0.6)] mb-2">
                Servizio *
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="admin-input w-full"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="admin-btn admin-btn-secondary"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aggiunta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Aggiungi alla Coda
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In Service Section */}
      {inService.length > 0 && (
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-green-400" />
            In Servizio
            <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/20 text-green-400">
              {inService.length}
            </span>
          </h3>
          <div className="space-y-3">
            {inService.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-black font-bold">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">{item.clientName}</p>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">
                    {item.serviceName}
                    {item.barberName && ` • ${item.barberName}`}
                  </p>
                </div>
                <button
                  onClick={() => handleComplete(item.id, item.clientName)}
                  className="admin-btn admin-btn-primary flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Completa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Section */}
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          In Coda
          <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">
            {inQueue.length}
          </span>
        </h3>

        {inQueue.length === 0 ? (
          <EmptyState preset="queue" />
        ) : (
          <div className="space-y-3">
            {inQueue.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  index === 0
                    ? 'bg-[rgba(212,168,85,0.1)] border-[rgba(212,168,85,0.3)]'
                    : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]'
                }`}
              >
                {/* Position */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    index === 0
                      ? 'bg-[#d4a855] text-black'
                      : 'bg-[rgba(255,255,255,0.1)] text-white'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white truncate">
                      {item.clientName}
                    </p>
                    {index === 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#d4a855] text-black">
                        PROSSIMO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[rgba(255,255,255,0.5)]">
                    {item.serviceName} ({item.serviceDuration} min)
                    {item.barberName && ` • ${item.barberName}`}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[rgba(255,255,255,0.4)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Arrivo: {formatCheckinTime(item.checkedInAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Attesa: {formatWaitTime(item.estimatedWaitMinutes * (index + 1))}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                {item.clientPhone && (
                  <a
                    href={`tel:${item.clientPhone}`}
                    className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-blue-500/20 text-[rgba(255,255,255,0.5)] hover:text-blue-400 transition-all"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
