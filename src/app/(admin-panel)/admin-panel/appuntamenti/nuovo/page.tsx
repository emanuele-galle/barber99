'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Search, User, Phone, Mail, MessageSquare,
  Calendar, Clock, Scissors,
} from 'lucide-react'
import Link from 'next/link'
import { getAvailableSlots, formatDate, type TimeSlot, type Appointment } from '@/lib/booking'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Client {
  id: string
  name: string
  phone: string
  email?: string
}

export default function NuovoAppuntamentoPage() {
  const router = useRouter()

  // Form state
  const [clientSearch, setClientSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [manualEntry, setManualEntry] = useState(false)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')

  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data.docs || []))
      .catch(console.error)
  }, [])

  // Search clients
  useEffect(() => {
    if (clientSearch.length < 2) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(clientSearch)}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.docs || [])
        }
      } catch {}
    }, 300)
    return () => clearTimeout(timeout)
  }, [clientSearch])

  // Fetch booked slots
  const fetchBookedSlots = useCallback(async (date: string): Promise<Appointment[]> => {
    try {
      const res = await fetch(`/api/appointments?date=${date}`)
      if (res.ok) {
        const data = await res.json()
        return data.bookedSlots || []
      }
    } catch {}
    return []
  }, [])

  // Load available slots when date or service changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !selectedService) return
      const service = services.find((s) => s.id === selectedService)
      if (!service) return

      setIsLoadingSlots(true)
      const booked = await fetchBookedSlots(selectedDate)
      const slots = getAvailableSlots(new Date(selectedDate), '1', service.duration, booked)
      setAvailableSlots(slots)
      setIsLoadingSlots(false)
    }
    loadSlots()
  }, [selectedDate, selectedService, services, fetchBookedSlots])

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    setClientName(client.name)
    setClientPhone(client.phone)
    setClientEmail(client.email || '')
    setClientSearch('')
    setSearchResults([])
  }

  const handleSubmit = async () => {
    if (!clientName || !clientPhone || !selectedService || !selectedDate || !selectedTime) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
          clientName,
          clientEmail,
          clientPhone,
          notes,
          isAdminBooking: true,
        }),
      })

      if (res.ok) {
        router.push('/admin-panel/appuntamenti')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message || 'Errore durante la creazione')
      }
    } catch {
      setError('Errore di rete')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-2xl font-bold text-white">Nuovo Appuntamento</h1>
          <p className="text-[rgba(255,255,255,0.5)] text-sm">Inserimento manuale</p>
        </div>
      </div>

      {/* Client Section */}
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#d4a855]" />
          Cliente
        </h2>

        {!selectedClient && !manualEntry && (
          <>
            {/* Client search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,255,255,0.4)]" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Cerca cliente per nome o telefono..."
                className="admin-input w-full pl-10"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl overflow-hidden z-10">
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className="w-full px-4 py-3 text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center text-sm text-[#d4a855] font-medium">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{client.name}</p>
                        <p className="text-xs text-[rgba(255,255,255,0.5)]">{client.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setManualEntry(true)}
              className="text-sm text-[#d4a855] hover:text-[#e5b966] transition-colors"
            >
              oppure inserisci dati manualmente
            </button>
          </>
        )}

        {(selectedClient || manualEntry) && (
          <div className="space-y-3">
            {selectedClient && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(212,168,85,0.05)] border border-[rgba(212,168,85,0.2)]">
                <span className="text-sm text-[#d4a855]">Cliente selezionato: {selectedClient.name}</span>
                <button
                  onClick={() => { setSelectedClient(null); setManualEntry(false); setClientName(''); setClientPhone(''); setClientEmail('') }}
                  className="text-xs text-[rgba(255,255,255,0.5)] hover:text-white"
                >
                  Cambia
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
                  <User className="w-3.5 h-3.5" /> Nome *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="admin-input w-full"
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
                  <Phone className="w-3.5 h-3.5" /> Telefono *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="admin-input w-full"
                  placeholder="+39 320 123 4567"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] mb-1">
                <Mail className="w-3.5 h-3.5" /> Email (opzionale)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="admin-input w-full"
                placeholder="email@esempio.com"
              />
            </div>
          </div>
        )}
      </div>

      {/* Service Section */}
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

      {/* Date & Time Section */}
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
              <p className="text-sm text-[rgba(255,255,255,0.4)]">Nessun orario disponibile per questa data</p>
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
          <MessageSquare className="w-4 h-4" /> Note (opzionale)
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
          disabled={isSubmitting || !clientName || !clientPhone || !selectedService || !selectedDate || !selectedTime}
          className="admin-btn admin-btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creazione...' : 'Crea Appuntamento'}
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
