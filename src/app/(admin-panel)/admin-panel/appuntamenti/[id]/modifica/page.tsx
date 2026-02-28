'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, User, Phone, Mail, MessageSquare,
  Calendar, Clock, Scissors, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { getAvailableSlots, type TimeSlot, type Appointment as BookingAppointment } from '@/lib/booking'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

const statusOptions = [
  { value: 'pending', label: 'In Attesa' },
  { value: 'confirmed', label: 'Confermato' },
  { value: 'completed', label: 'Completato' },
  { value: 'cancelled', label: 'Annullato' },
  { value: 'noshow', label: 'No Show' },
]

export default function ModificaAppuntamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])

  // Form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [status, setStatus] = useState('confirmed')
  const [notes, setNotes] = useState('')

  // Original values for comparison
  const [originalDate, setOriginalDate] = useState('')
  const [originalTime, setOriginalTime] = useState('')

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch appointment and services
  useEffect(() => {
    async function fetchData() {
      try {
        const [aptRes, svcRes] = await Promise.all([
          fetch(`/api/appointments/${id}`, { credentials: 'include' }),
          fetch('/api/services'),
        ])

        if (aptRes.ok) {
          const apt = await aptRes.json()
          setClientName(apt.clientName || '')
          setClientPhone(apt.clientPhone || '')
          setClientEmail(apt.clientEmail || '')
          setSelectedService(typeof apt.service === 'object' ? apt.service.id : apt.service || '')
          const dateStr = apt.date ? String(apt.date).split('T')[0] : ''
          setSelectedDate(dateStr)
          setOriginalDate(dateStr)
          setSelectedTime(apt.time || '')
          setOriginalTime(apt.time || '')
          setStatus(apt.status || 'confirmed')
          setNotes(apt.notes || '')
        }

        if (svcRes.ok) {
          const data = await svcRes.json()
          setServices(data.docs || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Errore nel caricamento')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Fetch booked slots
  const fetchBookedSlots = useCallback(async (date: string): Promise<BookingAppointment[]> => {
    try {
      const res = await fetch(`/api/appointments?date=${date}`)
      if (res.ok) {
        const data = await res.json()
        // Exclude current appointment from booked slots
        return (data.bookedSlots || []).filter((s: { time: string }) => {
          // If same date as original, exclude original time
          return !(date === originalDate && s.time === originalTime)
        })
      }
    } catch {}
    return []
  }, [originalDate, originalTime])

  // Load available slots when date or service changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !selectedService) return
      const service = services.find((s) => s.id === selectedService)
      if (!service) return

      setIsLoadingSlots(true)
      const booked = await fetchBookedSlots(selectedDate)
      const slots = getAvailableSlots(new Date(selectedDate), '1', service.duration, booked)

      // Mark the current time as available (if same date)
      if (selectedDate === originalDate) {
        const enhancedSlots = slots.map((s) => ({
          ...s,
          available: s.available || s.time === originalTime,
        }))
        setAvailableSlots(enhancedSlots)
      } else {
        setAvailableSlots(slots)
      }

      setIsLoadingSlots(false)
    }
    loadSlots()
  }, [selectedDate, selectedService, services, fetchBookedSlots, originalDate, originalTime])

  const handleSubmit = async () => {
    if (!clientName || !clientPhone || !selectedService || !selectedDate || !selectedTime) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientName,
          clientPhone,
          clientEmail,
          service: selectedService,
          // Only send date/time if they actually changed to avoid unnecessary slot validation
          ...((selectedDate !== originalDate || selectedTime !== originalTime) && {
            date: selectedDate,
            time: selectedTime,
          }),
          status,
          notes,
        }),
      })

      if (res.ok) {
        router.push('/admin-panel/appuntamenti')
        router.refresh()
      } else {
        const data = await res.json()
        if (data.error === 'slot_conflict') {
          setError(data.message || 'Il nuovo orario è già occupato')
        } else {
          setError(data.message || 'Errore durante il salvataggio')
        }
      }
    } catch {
      setError('Errore di rete')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  const serviceDuration = services.find((s) => s.id === selectedService)?.duration

  return (
    <div className="max-w-2xl mx-auto space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin-panel/appuntamenti"
          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Modifica Appuntamento</h1>
          <p className="text-[rgba(255,255,255,0.5)] text-sm">{clientName} - {selectedDate}</p>
        </div>
      </div>

      {/* Status */}
      <div className="admin-card p-6">
        <label className="text-sm text-[rgba(255,255,255,0.5)] mb-2 block">Stato</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === opt.value
                  ? 'bg-[#d4a855] text-black'
                  : 'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client */}
      <div className="admin-card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#d4a855]" />
          Cliente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
              <User className="w-3.5 h-3.5" /> Nome *
            </label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="admin-input w-full" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
              <Phone className="w-3.5 h-3.5" /> Telefono *
            </label>
            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="admin-input w-full" />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="admin-input w-full" />
        </div>
      </div>

      {/* Service */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Scissors className="w-5 h-5 text-[#d4a855]" />
          Servizio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => { setSelectedService(service.id); setSelectedTime('') }}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedService === service.id
                  ? 'border-[#d4a855] bg-[rgba(212,168,85,0.1)]'
                  : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(212,168,85,0.3)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{service.name}</span>
                <span className="text-sm text-[#d4a855] font-semibold">&euro;{service.price}</span>
              </div>
              <span className="text-xs text-[rgba(255,255,255,0.4)]">{service.duration} min</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#d4a855]" />
          Data e Ora
        </h2>

        <div>
          <label className="text-sm text-[rgba(255,255,255,0.5)] mb-1 block">Data *</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
            className="admin-input w-full sm:w-auto"
          />
        </div>

        {selectedDate && selectedService && (
          <div>
            <label className="text-sm text-[rgba(255,255,255,0.5)] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Orario * {serviceDuration && `(${serviceDuration} min)`}
            </label>
            {isLoadingSlots ? (
              <div className="text-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-[#d4a855] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-[rgba(255,255,255,0.4)]">Nessun orario disponibile</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-[#d4a855] text-black'
                        : slot.available
                          ? 'bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'
                          : 'text-[rgba(255,255,255,0.2)] line-through cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="admin-card p-6">
        <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-2">
          <MessageSquare className="w-4 h-4" /> Note
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="admin-input w-full"
          rows={3}
          placeholder="Note interne..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="admin-btn admin-btn-primary flex-1 py-3 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
        <Link
          href="/admin-panel/appuntamenti"
          className="admin-btn admin-btn-secondary py-3"
        >
          Annulla
        </Link>
      </div>
    </div>
  )
}
