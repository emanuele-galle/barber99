'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  Check,
} from 'lucide-react'
import {
  getAvailableSlots,
  formatDateDisplay,
  formatDate,
  validateBookingData,
  defaultOpeningHours,
  isDateClosed,
  type BookingData,
  type TimeSlot,
  type Appointment,
  type ClosedDay,
} from '@/lib/booking'
import { useClientAuth } from '@/components/auth/ClientAuthProvider'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  shortDescription?: string
}

type Step = 'service' | 'datetime' | 'details' | 'confirm'

const DEFAULT_BARBER_ID = '1'
const DEFAULT_BARBER_NAME = 'Cosimo Pisani'

const SERVICE_ICONS: Record<string, string> = {
  taglio: '✂️',
  barba: '🪒',
  shampoo: '🧴',
  colore: '🎨',
  meches: '✨',
  trattamento: '💆',
}

function getServiceIcon(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '💈'
}

// Easing curve per transizioni
const easeOut: [number, number, number, number] = [0.4, 0, 0.2, 1]

// Step label map for accessibility
const STEP_LABELS: Record<Step, string> = {
  service: 'Servizio',
  datetime: 'Data e Ora',
  details: 'Dati Personali',
  confirm: 'Conferma',
}

// Progress dots component
function ProgressDots({ currentStep }: { currentStep: Step }) {
  const steps: Step[] = ['service', 'datetime', 'details']
  const currentIndex = steps.indexOf(currentStep)
  if (currentStep === 'confirm') return null

  return (
    <div
      className="flex items-center justify-center gap-0 mb-6 md:mb-8"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Passaggio ${currentIndex + 1} di ${steps.length}: ${STEP_LABELS[currentStep]}`}
    >
      {steps.map((s, i) => {
        const isCompleted = i < currentIndex
        const isActive = i === currentIndex
        const isFuture = i > currentIndex
        return (
          <div key={s} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-[1.5px] w-8 md:w-12 transition-colors duration-300 ${
                  isCompleted ? 'bg-gold/50' : 'bg-white/10'
                }`}
              />
            )}
            <motion.div
              className={`rounded-full transition-colors duration-300 ${
                isActive
                  ? 'bg-gold h-2.5 w-8'
                  : isCompleted
                    ? 'bg-gold h-2.5 w-2.5'
                    : 'bg-white/20 h-2.5 w-2.5'
              }`}
              layout
              transition={{ duration: 0.3, ease: easeOut }}
            />
          </div>
        )
      })}
    </div>
  )
}

// Animated checkmark SVG
function AnimatedCheckmark() {
  return (
    <motion.div
      className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
    >
      <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

export default function BookingForm() {
  const { client, isAuthenticated } = useClientAuth()
  const [step, setStep] = useState<Step>('service')
  const [direction, setDirection] = useState(1) // 1 = avanti, -1 = indietro
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

  // Pre-fill from auth
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
  const [openingHours, setOpeningHours] = useState(defaultOpeningHours)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingLinks, setBookingLinks] = useState<{ whatsapp?: string; cancel?: string }>({})

  // Fetch services, closed days, and opening hours
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true)
      try {
        const [servicesRes, closedDaysRes, hoursRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/closed-days?limit=100'),
          fetch('/api/opening-hours'),
        ])
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setServices(data.docs || [])
        }
        if (closedDaysRes.ok) {
          const data = await closedDaysRes.json()
          setClosedDays(data.docs || [])
        }
        if (hoursRes.ok) {
          const data = await hoursRes.json()
          if (data.openingHours?.length > 0) {
            setOpeningHours(data.openingHours)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Generate calendar grid for the current month
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Max 2 months ahead
    const maxDate = new Date(today)
    maxDate.setMonth(maxDate.getMonth() + 2)

    // Padding days from previous month (week starts Monday)
    const startDow = (firstDay.getDay() + 6) % 7 // 0=Mon, 6=Sun

    const days: { date: Date; dateStr: string; available: boolean; isCurrentMonth: boolean }[] = []

    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      days.push({ date: d, dateStr: formatDate(d), available: false, isCurrentMonth: false })
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day)
      const dayOfWeek = d.getDay()
      const dayHours = openingHours.find((h) => h.dayOfWeek === dayOfWeek)
      const isPast = d < tomorrow
      const isTooFar = d > maxDate
      const isClosed = !dayHours || dayHours.isClosed || isDateClosed(d, closedDays)
      const available = !isPast && !isTooFar && !isClosed

      days.push({ date: d, dateStr: formatDate(d), available, isCurrentMonth: true })
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, dateStr: formatDate(d), available: false, isCurrentMonth: false })
    }

    return days
  }, [calendarMonth, closedDays, openingHours])

  const navigateMonth = (dir: number) => {
    setCalendarMonth((prev) => {
      let newMonth = prev.month + dir
      let newYear = prev.year
      if (newMonth > 11) { newMonth = 0; newYear++ }
      if (newMonth < 0) { newMonth = 11; newYear-- }
      return { year: newYear, month: newMonth }
    })
  }

  const canGoPrev = useMemo(() => {
    const now = new Date()
    return calendarMonth.year > now.getFullYear() || calendarMonth.month > now.getMonth()
  }, [calendarMonth])

  const canGoNext = useMemo(() => {
    const now = new Date()
    const maxMonth = now.getMonth() + 2
    const maxYear = now.getFullYear() + (maxMonth > 11 ? 1 : 0)
    const adjustedMax = maxMonth > 11 ? maxMonth - 12 : maxMonth
    return calendarMonth.year < maxYear || (calendarMonth.year === maxYear && calendarMonth.month < adjustedMax)
  }, [calendarMonth])

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

  // Load available slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (formData.date && formData.barberId && formData.serviceId) {
        const service = services.find((s) => s.id === formData.serviceId)
        if (service) {
          setIsLoadingSlots(true)
          const bookedSlots = await fetchBookedSlots(formData.date, formData.barberId)
          const slots = getAvailableSlots(new Date(formData.date), formData.barberId, service.duration, bookedSlots, openingHours)
          setAvailableSlots(slots)
          setIsLoadingSlots(false)
        }
      }
    }
    loadSlots()
  }, [formData.date, formData.barberId, formData.serviceId, services, fetchBookedSlots, openingHours])

  const selectedService = services.find((s) => s.id === formData.serviceId)

  // --- Handlers ---

  const handleServiceSelect = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, serviceId, date: '', time: '' }))
    setTimeout(() => {
      setDirection(1)
      setStep('datetime')
    }, 200)
  }

  const handleDateSelect = (dateStr: string) => {
    setFormData((prev) => ({ ...prev, date: dateStr, time: '' }))
  }

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, time }))
    setTimeout(() => {
      setDirection(1)
      setStep('details')
    }, 200)
  }

  const handleDetailsChange = (field: keyof BookingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
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
          status: 'confirmed',
        }),
      })
      if (response.ok) {
        const result = await response.json()
        setBookingLinks({ whatsapp: result.whatsappLink, cancel: result.cancellationLink })
        setBookingConfirmed(true)
        setStep('confirm')
      } else {
        const errorData = await response.json()

        // Slot conflict (409) - someone else booked this slot
        if (response.status === 409 && errorData.error === 'slot_conflict') {
          setErrors({ submit: 'Orario appena prenotato da qualcun altro. Scegli un altro orario.' })
          // Re-fetch available slots and go back to datetime
          setFormData((prev) => ({ ...prev, time: '' }))
          setDirection(-1)
          setStep('datetime')
          // Refresh slots
          if (formData.date && formData.serviceId) {
            const service = services.find((s) => s.id === formData.serviceId)
            if (service) {
              const bookedSlots = await fetchBookedSlots(formData.date, formData.barberId)
              const slots = getAvailableSlots(new Date(formData.date), formData.barberId, service.duration, bookedSlots, openingHours)
              setAvailableSlots(slots)
            }
          }
          return
        }

        // Already has an active booking (400)
        if (response.status === 400 && errorData.error === 'already_booked') {
          setErrors({
            submit: errorData.message,
            existingCancelLink: errorData.existingAppointment?.cancellationLink,
          })
          return
        }

        throw new Error(errorData.message || 'Booking failed')
      }
    } catch {
      setErrors({ submit: 'Si è verificato un errore. Riprova più tardi.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    setDirection(-1)
    switch (step) {
      case 'datetime':
        setStep('service')
        break
      case 'details':
        setStep('datetime')
        break
    }
  }

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  // Loading state
  if (isLoadingData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12" role="status" aria-label="Caricamento servizi">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-400">Caricamento servizi...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressDots currentStep={step} />

      {/* Live region for step announcements */}
      <div aria-live="polite" className="sr-only">
        {step !== 'confirm' && `Passaggio: ${STEP_LABELS[step]}`}
        {step === 'confirm' && 'Prenotazione confermata'}
      </div>

      {/* Live region for error announcements */}
      <div aria-live="assertive" className="sr-only">
        {errors.submit && errors.submit}
        {errors.clientName && `Nome: ${errors.clientName}`}
        {errors.clientPhone && `Telefono: ${errors.clientPhone}`}
        {errors.clientEmail && `Email: ${errors.clientEmail}`}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {/* ===== STEP 1: SERVIZIO ===== */}
        {step === 'service' && (
          <motion.div
            key="service"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOut }}
            className="space-y-3"
          >
            <h2 className="text-xl md:text-2xl font-cinzel text-gold mb-4 md:mb-6">
              Scegli il Servizio
            </h2>

            {services.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nessun servizio disponibile</p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    whileTap={{ scale: 0.97 }}
                    aria-pressed={formData.serviceId === service.id}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] focus-visible:outline-none ${
                      formData.serviceId === service.id
                        ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,168,85,0.15)]'
                        : 'border-white/10 bg-[#1a1a1a] hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/5">
                        {getServiceIcon(service.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-[15px]">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.duration} min</p>
                      </div>
                      <span className="text-gold font-semibold text-lg flex-shrink-0">
                        &euro;{service.price}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ===== STEP 2: DATA & ORA ===== */}
        {step === 'datetime' && (
          <motion.div
            key="datetime"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOut }}
          >
            {/* Back button */}
            <button
              onClick={goBack}
              className="text-gold hover:text-gold-light mb-4 flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
            >
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>

            {/* Service chip summary */}
            {selectedService && (
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-sm text-gray-400">{selectedService.name}</span>
                <span className="text-gold text-sm font-medium">&euro;{selectedService.price}</span>
              </div>
            )}

            {/* Monthly Calendar */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-cinzel text-gold mb-4">
                Scegli la Data
              </h2>

              {/* Month navigation */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  onClick={() => canGoPrev && navigateMonth(-1)}
                  disabled={!canGoPrev}
                  aria-label="Mese precedente"
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-medium capitalize" aria-live="polite">
                  {new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => canGoNext && navigateMonth(1)}
                  disabled={!canGoNext}
                  aria-label="Mese successivo"
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1">
                {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                  <div key={d} className="text-center text-[11px] text-gray-500 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label="Calendario disponibilità">
                {calendarDays.map((day, i) => {
                  const isSelected = formData.date === day.dateStr
                  const dayLabel = day.isCurrentMonth
                    ? day.date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
                    : undefined
                  return (
                    <button
                      key={i}
                      onClick={() => day.available && handleDateSelect(day.dateStr)}
                      disabled={!day.available}
                      aria-label={dayLabel}
                      aria-current={isSelected ? 'date' : undefined}
                      aria-disabled={!day.available}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] focus-visible:outline-none ${
                        !day.isCurrentMonth
                          ? 'text-gray-800'
                          : isSelected
                            ? 'bg-gold text-[#0c0c0c] shadow-[0_0_12px_rgba(212,168,85,0.3)]'
                            : day.available
                              ? 'text-white hover:bg-gold/20 hover:text-gold'
                              : 'text-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {day.isCurrentMonth ? day.date.getDate() : ''}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Grid - appare sotto le date */}
            <AnimatePresence>
              {formData.date && (
                <motion.div
                  key="time-grid"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <h3 className="text-lg md:text-xl font-cinzel text-gold mb-3">
                    Scegli l&apos;Orario
                  </h3>

                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Verifica disponibilità...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-400 text-center py-6 text-sm">
                      Nessun orario disponibile per questa data
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {availableSlots.map((slot, index) => (
                        <motion.button
                          key={slot.time}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          aria-pressed={formData.time === slot.time}
                          aria-label={`Orario ${slot.time}${!slot.available ? ', non disponibile' : ''}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          whileTap={slot.available ? { scale: 0.93 } : undefined}
                          className={`min-h-[52px] py-3 px-2 rounded-xl text-center text-[15px] font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] focus-visible:outline-none ${
                            formData.time === slot.time
                              ? 'bg-gold text-[#0c0c0c] shadow-[0_0_16px_rgba(212,168,85,0.3)]'
                              : slot.available
                                ? 'bg-[#1a1a1a] border border-white/10 text-white hover:border-gold/30'
                                : 'bg-transparent text-gray-700 line-through cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== STEP 3: DATI PERSONALI ===== */}
        {step === 'details' && (
          <motion.div
            key="details"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOut }}
          >
            {/* Back button */}
            <button
              onClick={goBack}
              className="text-gold hover:text-gold-light mb-4 flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
            >
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>

            {/* Summary card tappabile */}
            <button
              onClick={goBack}
              className="w-full p-4 rounded-xl bg-[#1a1a1a] border border-white/10 mb-6 text-left hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <Scissors className="w-4 h-4 text-gold flex-shrink-0" />
                  <span className="text-white">{selectedService?.name}</span>
                </div>
                <span className="text-gold font-semibold">&euro;{selectedService?.price}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formData.date ? formatDateDisplay(new Date(formData.date)) : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formData.time}</span>
                </div>
              </div>
            </button>

            {/* Contact Form */}
            <h2 className="text-xl md:text-2xl font-cinzel text-gold mb-4">I tuoi Dati</h2>

            {/* Auth status */}
            {isAuthenticated ? (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-green-400 text-sm">Dati pre-compilati dal tuo account</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-white/10 mb-4 text-sm">
                <span className="text-gray-400">Hai già un account? </span>
                <Link href="/account/login" className="text-gold hover:underline">
                  Accedi
                </Link>
                <span className="text-gray-400"> per compilare automaticamente.</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label htmlFor="booking-name" className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  Nome e Cognome *
                </label>
                <input
                  id="booking-name"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleDetailsChange('clientName', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.clientName}
                  aria-describedby={errors.clientName ? 'booking-name-error' : undefined}
                  className={`w-full p-4 rounded-xl bg-[#1a1a1a] border text-[16px] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] ${
                    errors.clientName ? 'border-red-500' : 'border-white/10'
                  } text-white focus:border-gold focus:outline-none transition-colors`}
                  placeholder="Mario Rossi"
                />
                {errors.clientName && (
                  <p id="booking-name-error" role="alert" className="text-red-400 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              {/* Telefono */}
              <div>
                <label htmlFor="booking-phone" className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Telefono *
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleDetailsChange('clientPhone', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.clientPhone}
                  aria-describedby={errors.clientPhone ? 'booking-phone-error' : undefined}
                  className={`w-full p-4 rounded-xl bg-[#1a1a1a] border text-[16px] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] ${
                    errors.clientPhone ? 'border-red-500' : 'border-white/10'
                  } text-white focus:border-gold focus:outline-none transition-colors`}
                  placeholder="+39 320 123 4567"
                />
                {errors.clientPhone && (
                  <p id="booking-phone-error" role="alert" className="text-red-400 text-xs mt-1">{errors.clientPhone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="booking-email" className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email <span className="text-gray-600">(opzionale)</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleDetailsChange('clientEmail', e.target.value)}
                  aria-invalid={!!errors.clientEmail}
                  aria-describedby={errors.clientEmail ? 'booking-email-error' : undefined}
                  className={`w-full p-4 rounded-xl bg-[#1a1a1a] border text-[16px] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] ${
                    errors.clientEmail ? 'border-red-500' : 'border-white/10'
                  } text-white focus:border-gold focus:outline-none transition-colors`}
                  placeholder="Per ricevere conferma email"
                />
                {errors.clientEmail && (
                  <p id="booking-email-error" role="alert" className="text-red-400 text-xs mt-1">{errors.clientEmail}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label htmlFor="booking-notes" className="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Note <span className="text-gray-600">(opzionale)</span>
                </label>
                <textarea
                  id="booking-notes"
                  value={formData.notes}
                  onChange={(e) => handleDetailsChange('notes', e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-[16px] focus:border-gold focus:outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
                  placeholder="Preferenze particolari..."
                  rows={3}
                />
              </div>

              {errors.submit && (
                <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                  {errors.existingCancelLink && (
                    <a
                      href={errors.existingCancelLink}
                      className="inline-block mt-2 text-gold hover:text-gold-light text-sm font-medium underline"
                    >
                      Annulla la prenotazione esistente
                    </a>
                  )}
                </div>
              )}

              {/* Submit button */}
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold to-gold-light text-[#0c0c0c] font-bold text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c] focus-visible:outline-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0c0c0c] border-t-transparent rounded-full animate-spin" />
                    Invio in corso...
                  </span>
                ) : (
                  'Prenota Ora'
                )}
              </motion.button>

              <p className="text-center text-xs text-gray-600 pb-4">
                Il pagamento avviene in negozio.
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 4: CONFERMA ===== */}
        {step === 'confirm' && bookingConfirmed && (
          <motion.div
            key="confirm"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: easeOut }}
            className="text-center"
            role="status"
            aria-live="polite"
          >
            <AnimatedCheckmark />

            <h2 className="text-2xl md:text-3xl font-cinzel text-gold mb-2">
              Prenotazione Confermata!
            </h2>
            <p className="text-gray-400 mb-8">
              Grazie, {formData.clientName.split(' ')[0]}!
            </p>

            {/* Dettagli appuntamento */}
            <div className="p-5 rounded-xl bg-[#1a1a1a] border border-white/10 text-left max-w-sm mx-auto mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Scissors className="w-4 h-4 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{selectedService?.name}</p>
                    <p className="text-gray-500 text-xs">con {DEFAULT_BARBER_NAME}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="text-white text-sm">{formatDateDisplay(new Date(formData.date))}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="text-white text-sm">ore {formData.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                  <p className="text-white text-sm">Via San Biagio 3, Serra San Bruno</p>
                </div>
              </div>
            </div>

            {/* Email notification */}
            {formData.clientEmail && (
              <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Conferma inviata a {formData.clientEmail}
              </p>
            )}

            {/* WhatsApp + Cancellazione */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto mb-6">
              {bookingLinks.whatsapp && (
                <a
                  href={bookingLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl border border-[#25D366]/40 text-[#25D366] font-medium text-center flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Invia su WhatsApp
                </a>
              )}

              {/* Cancellation info - prominent */}
              {bookingLinks.cancel && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-gray-400 text-sm mb-2">
                    Per annullare, usa il link qui sotto o quello ricevuto via email/WhatsApp
                  </p>
                  <a
                    href={bookingLinks.cancel}
                    className="inline-block text-gold hover:text-gold-light text-sm font-medium underline transition-colors"
                  >
                    Annulla prenotazione
                  </a>
                </div>
              )}
            </div>

            {/* CTA Registrazione se non loggato */}
            {!isAuthenticated && (
              <div className="p-5 rounded-xl bg-gold/5 border border-gold/20 max-w-sm mx-auto mb-6">
                <h3 className="text-gold font-semibold text-sm mb-1">
                  Prenota ancora più velocemente!
                </h3>
                <p className="text-gray-400 text-xs mb-3">
                  Crea un account per salvare i tuoi dati e gestire le prenotazioni.
                </p>
                <Link
                  href={`/account/registrati${formData.clientEmail ? `?email=${encodeURIComponent(formData.clientEmail)}` : ''}`}
                  className="inline-block bg-gold hover:bg-gold-light text-[#0c0c0c] font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
                >
                  Crea Account
                </Link>
              </div>
            )}

            {/* Home / Account links */}
            <div className="flex items-center justify-center gap-4">
              {isAuthenticated && (
                <Link
                  href="/account"
                  className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
                >
                  Il tuo Account
                </Link>
              )}
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Torna alla Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
