'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import {
  getNextAvailableDates,
  getAvailableSlots,
  formatDateDisplay,
  formatDate,
  validateBookingData,
  type BookingData,
  type TimeSlot,
  type Appointment,
  type ClosedDay,
} from '@/lib/booking'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'

// Types for API responses
interface Service {
  id: string
  name: string
  price: number
  duration: number
  shortDescription?: string
}

type Step = 'service' | 'datetime' | 'details' | 'confirm'

// Barbiere singolo predefinito
const DEFAULT_BARBER_ID = '1'
const DEFAULT_BARBER_NAME = 'Cosimo Pisani'

export default function BookingForm() {
  const { client, isAuthenticated } = useClientAuth()
  const [step, setStep] = useState<Step>('service')
  const [formData, setFormData] = useState<BookingData>({
    serviceId: '',
    barberId: DEFAULT_BARBER_ID,
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  })

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (isAuthenticated && client) {
      setFormData((prev) => ({
        ...prev,
        clientName: client.name || prev.clientName,
        clientEmail: client.email || prev.clientEmail,
        clientPhone: client.phone || prev.clientPhone,
      }))
    }
  }, [isAuthenticated, client])

  // Data from API
  const [services, setServices] = useState<Service[]>([])
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingLinks, setBookingLinks] = useState<{ whatsapp?: string; cancel?: string }>({})

  // Fetch services and closed days from API on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true)
      try {
        // Fetch services and closed days in parallel
        const [servicesRes, closedDaysRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/closed-days?limit=100')
        ])

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setServices(servicesData.docs || [])
        }

        if (closedDaysRes.ok) {
          const closedDaysData = await closedDaysRes.json()
          setClosedDays(closedDaysData.docs || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [])

  // Load available dates when closedDays are fetched
  useEffect(() => {
    // Only calculate dates once we have closedDays loaded
    if (!isLoadingData) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setAvailableDates(getNextAvailableDates(tomorrow, 14, undefined, closedDays))
    }
  }, [closedDays, isLoadingData])

  // Fetch booked slots from API
  const fetchBookedSlots = useCallback(async (date: string, barberId: string): Promise<Appointment[]> => {
    try {
      const response = await fetch(`/api/appointments?date=${date}&barberId=${barberId}`)
      if (response.ok) {
        const data = await response.json()
        return data.bookedSlots || []
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error)
    }
    return []
  }, [])

  // Load available slots when date or barber changes
  useEffect(() => {
    async function loadSlots() {
      if (formData.date && formData.barberId && formData.serviceId) {
        const service = services.find((s) => s.id === formData.serviceId)
        if (service) {
          setIsLoadingSlots(true)

          // Fetch existing appointments from API
          const bookedSlots = await fetchBookedSlots(formData.date, formData.barberId)

          const slots = getAvailableSlots(
            new Date(formData.date),
            formData.barberId,
            service.duration,
            bookedSlots
          )
          setAvailableSlots(slots)
          setIsLoadingSlots(false)
        }
      }
    }

    loadSlots()
  }, [formData.date, formData.barberId, formData.serviceId, services, fetchBookedSlots])

  const selectedService = services.find((s) => s.id === formData.serviceId)

  const handleServiceSelect = (serviceId: string) => {
    setFormData({ ...formData, serviceId, time: '' })
    setStep('datetime')  // Salta direttamente a datetime (barbiere singolo)
  }

  const handleDateSelect = (date: string) => {
    setFormData({ ...formData, date, time: '' })
  }

  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time })
    setStep('details')
  }

  const handleDetailsChange = (field: keyof BookingData, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleSubmit = async () => {
    const validation = validateBookingData(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: formData.serviceId,
          barber: formData.barberId,
          date: formData.date,
          time: formData.time,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          notes: formData.notes,
          status: 'pending',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setBookingLinks({
          whatsapp: result.whatsappLink,
          cancel: result.cancellationLink,
        })
        setBookingConfirmed(true)
        setStep('confirm')
      } else {
        throw new Error('Booking failed')
      }
    } catch {
      setErrors({ submit: 'Si è verificato un errore. Riprova più tardi.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    switch (step) {
      case 'datetime':
        setStep('service')
        break
      case 'details':
        setStep('datetime')
        break
    }
  }

  // Progress indicator
  const steps: Step[] = ['service', 'datetime', 'details']
  const currentStepIndex = steps.indexOf(step)

  // Loading state
  if (isLoadingData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400">Caricamento servizi...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      {step !== 'confirm' && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Servizio', 'Data/Ora', 'Dati'].map((label, index) => (
              <span
                key={label}
                className={`text-sm ${
                  index <= currentStepIndex ? 'text-gold' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-cinzel text-gold mb-6">Seleziona un Servizio</h2>
            {services.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nessun servizio disponibile</p>
            ) : (
              <div className="grid gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.serviceId === service.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.duration} minuti</p>
                      </div>
                      <span className="text-gold font-semibold">&euro;{service.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={goBack} className="text-gold hover:text-gold-light mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Indietro
            </button>

            {/* Date Selection */}
            <div>
              <h2 className="text-2xl font-cinzel text-gold mb-4">Seleziona la Data</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableDates.map((date) => {
                  const dateStr = formatDate(date)
                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateSelect(dateStr)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.date === dateStr
                          ? 'border-gold bg-gold/10'
                          : 'border-gray-700 hover:border-gold/50'
                      }`}
                    >
                      <div className="text-sm text-gray-400">
                        {date.toLocaleDateString('it-IT', { weekday: 'short' })}
                      </div>
                      <div className="font-semibold text-white">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.toLocaleDateString('it-IT', { month: 'short' })}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            {formData.date && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-xl font-cinzel text-gold mb-4">Seleziona l&apos;Orario</h3>
                {isLoadingSlots ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Verifica disponibilità...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`min-h-[44px] py-3 px-2 rounded-lg border text-center transition-all ${
                            formData.time === slot.time
                              ? 'border-gold bg-gold text-black font-semibold'
                              : slot.available
                              ? 'border-gray-700 hover:border-gold/50 text-white'
                              : 'border-gray-800 bg-gray-900 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-gray-400 text-center py-4">
                        Nessun orario disponibile per questa data
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Contact Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={goBack} className="text-gold hover:text-gold-light mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Indietro
            </button>

            {/* Booking Summary */}
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
              <h3 className="text-gold font-cinzel mb-3">Riepilogo Prenotazione</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Servizio:</span> {selectedService?.name}</p>
                <p><span className="text-gray-400">Barbiere:</span> {DEFAULT_BARBER_NAME}</p>
                <p><span className="text-gray-400">Data:</span> {formatDateDisplay(new Date(formData.date))}</p>
                <p><span className="text-gray-400">Ora:</span> {formData.time}</p>
                <p className="text-gold font-semibold">Totale: &euro;{selectedService?.price}</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-cinzel text-gold mb-4">I tuoi Dati</h2>

              {/* Auth status banner */}
              {isAuthenticated ? (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400 text-sm">Dati pre-compilati dal tuo account</span>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 mb-4 text-sm">
                  <span className="text-gray-400">Hai già un account? </span>
                  <Link href="/account/login" className="text-gold hover:underline">
                    Accedi
                  </Link>
                  <span className="text-gray-400"> per compilare i dati automaticamente.</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome e Cognome *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleDetailsChange('clientName', e.target.value)}
                    className={`w-full p-4 rounded-lg bg-gray-900 border text-base ${
                      errors.clientName ? 'border-red-500' : 'border-gray-700'
                    } text-white focus:border-gold focus:outline-none`}
                    style={{ fontSize: '16px' }}
                    placeholder="Mario Rossi"
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleDetailsChange('clientEmail', e.target.value)}
                    className={`w-full p-4 rounded-lg bg-gray-900 border text-base ${
                      errors.clientEmail ? 'border-red-500' : 'border-gray-700'
                    } text-white focus:border-gold focus:outline-none`}
                    style={{ fontSize: '16px' }}
                    placeholder="mario@email.com"
                  />
                  {errors.clientEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Telefono *</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handleDetailsChange('clientPhone', e.target.value)}
                    className={`w-full p-4 rounded-lg bg-gray-900 border text-base ${
                      errors.clientPhone ? 'border-red-500' : 'border-gray-700'
                    } text-white focus:border-gold focus:outline-none`}
                    style={{ fontSize: '16px' }}
                    placeholder="+39 320 123 4567"
                  />
                  {errors.clientPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Note (opzionale)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleDetailsChange('notes', e.target.value)}
                    className="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 text-white text-base focus:border-gold focus:outline-none"
                    style={{ fontSize: '16px' }}
                    placeholder="Preferenze particolari..."
                    rows={3}
                  />
                </div>

                {errors.submit && (
                  <p className="text-red-500 text-center">{errors.submit}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full btn-gold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Invio in corso...' : 'Conferma Prenotazione'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Riceverai una conferma via email. Il pagamento avviene in negozio.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && bookingConfirmed && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-cinzel text-gold mb-4">Prenotazione Confermata!</h2>
            <p className="text-gray-300 mb-6">
              Grazie, {formData.clientName.split(' ')[0]}! La tua prenotazione è stata registrata.
            </p>

            <div className="p-6 rounded-lg bg-gray-900 border border-gray-800 text-left max-w-sm mx-auto mb-8">
              <h3 className="text-gold font-cinzel mb-4">Dettagli Appuntamento</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Servizio:</span> {selectedService?.name}</p>
                <p><span className="text-gray-400">Barbiere:</span> {DEFAULT_BARBER_NAME}</p>
                <p><span className="text-gray-400">Data:</span> {formatDateDisplay(new Date(formData.date))}</p>
                <p><span className="text-gray-400">Ora:</span> {formData.time}</p>
                <p className="pt-2 border-t border-gray-700">
                  <span className="text-gray-400">Indirizzo:</span><br />
                  Via San Biagio 3, Serra San Bruno
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Ti abbiamo inviato una email di conferma a {formData.clientEmail}
            </p>

            {/* WhatsApp & Cancel buttons */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto mb-6">
              {bookingLinks.whatsapp && (
                <a
                  href={bookingLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-lg bg-[#25D366] text-white font-semibold text-center flex items-center justify-center gap-2 hover:bg-[#20BD5A] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Conferma WhatsApp
                </a>
              )}
              {bookingLinks.cancel && (
                <a
                  href={bookingLinks.cancel}
                  className="flex-1 py-3 px-4 rounded-lg border border-white/20 text-white/60 font-medium text-center hover:bg-white/5 hover:text-white transition-colors text-sm"
                >
                  Devi cancellare?
                </a>
              )}
            </div>

            {/* CTA Registrazione se non loggato */}
            {!isAuthenticated && (
              <div className="p-6 rounded-lg bg-gold/10 border border-gold/30 max-w-sm mx-auto mb-8">
                <h3 className="text-gold font-semibold mb-2">Prenota ancora più velocemente!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Crea un account per salvare i tuoi dati e gestire le tue prenotazioni.
                </p>
                <Link
                  href={`/account/registrati?email=${encodeURIComponent(formData.clientEmail)}`}
                  className="inline-block bg-gold hover:bg-gold-light text-black font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Crea Account
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <Link href="/account" className="btn-gold inline-block mr-3">
                Il tuo Account
              </Link>
            )}

            <a href="/" className={isAuthenticated ? "text-gold hover:text-gold-light" : "btn-gold inline-block"}>
              Torna alla Home
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
