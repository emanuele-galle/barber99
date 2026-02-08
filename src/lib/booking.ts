// Booking utility functions for slot availability calculation

export interface TimeSlot {
  time: string
  available: boolean
}

export interface OpeningHour {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
  breakStart?: string
  breakEnd?: string
}

export interface Appointment {
  date: string
  time: string
  duration: number
  barberId: string
}

export interface ClosedDay {
  id: string
  date: string
  type: 'holiday' | 'vacation' | 'special'
  reason?: string
  recurring: boolean
}

// Default opening hours (can be overridden from CMS)
export const defaultOpeningHours: OpeningHour[] = [
  { dayOfWeek: 0, openTime: '09:00', closeTime: '19:30', isClosed: true }, // Domenica - Chiuso
  { dayOfWeek: 1, openTime: '09:00', closeTime: '19:30', isClosed: true }, // Lunedì - Chiuso
  { dayOfWeek: 2, openTime: '09:00', closeTime: '19:30', isClosed: false }, // Martedì
  { dayOfWeek: 3, openTime: '09:00', closeTime: '19:30', isClosed: false }, // Mercoledì
  { dayOfWeek: 4, openTime: '09:00', closeTime: '19:30', isClosed: false }, // Giovedì
  { dayOfWeek: 5, openTime: '09:00', closeTime: '19:30', isClosed: false }, // Venerdì
  { dayOfWeek: 6, openTime: '09:00', closeTime: '19:30', isClosed: false }, // Sabato
]

// Convert time string to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Convert minutes since midnight to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Generate all possible time slots for a day
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  slotDuration: number = 30
): string[] {
  const slots: string[] = []
  const startMinutes = timeToMinutes(openTime)
  const endMinutes = timeToMinutes(closeTime)

  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    slots.push(minutesToTime(minutes))
  }

  return slots
}

// Check if a slot is available
export function isSlotAvailable(
  slotTime: string,
  serviceDuration: number,
  existingAppointments: Appointment[],
  closeTime: string
): boolean {
  const slotMinutes = timeToMinutes(slotTime)
  const closeMinutes = timeToMinutes(closeTime)

  // Check if service would extend past closing time
  if (slotMinutes + serviceDuration > closeMinutes) {
    return false
  }

  // Check for conflicts with existing appointments
  for (const apt of existingAppointments) {
    const aptStart = timeToMinutes(apt.time)
    const aptEnd = aptStart + apt.duration

    const slotStart = slotMinutes
    const slotEnd = slotMinutes + serviceDuration

    // Check for overlap
    if (slotStart < aptEnd && slotEnd > aptStart) {
      return false
    }
  }

  return true
}

// Check if a slot falls within break time
function isInBreakTime(slotTime: string, breakStart?: string, breakEnd?: string): boolean {
  if (!breakStart || !breakEnd) return false

  const slotMinutes = timeToMinutes(slotTime)
  const breakStartMinutes = timeToMinutes(breakStart)
  const breakEndMinutes = timeToMinutes(breakEnd)

  return slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes
}

// Get available slots for a specific date and barber
export function getAvailableSlots(
  date: Date,
  barberId: string,
  serviceDuration: number,
  existingAppointments: Appointment[],
  openingHours: OpeningHour[] = defaultOpeningHours,
  closedDays: ClosedDay[] = []
): TimeSlot[] {
  // Check if this date is a special closed day (holiday, vacation, etc.)
  if (isDateClosed(date, closedDays)) {
    return []
  }

  const dayOfWeek = date.getDay()
  const dayHours = openingHours.find((h) => h.dayOfWeek === dayOfWeek)

  // If day is closed, return empty
  if (!dayHours || dayHours.isClosed) {
    return []
  }

  // Appointments are already filtered server-side by date and barber
  // Use them directly for slot availability checking
  const barberAppointments = existingAppointments

  // Generate all possible slots
  const allSlots = generateTimeSlots(dayHours.openTime, dayHours.closeTime, 30)

  // Check availability for each slot (including break time exclusion)
  return allSlots.map((time) => ({
    time,
    available:
      !isInBreakTime(time, dayHours.breakStart, dayHours.breakEnd) &&
      isSlotAvailable(time, serviceDuration, barberAppointments, dayHours.closeTime),
  }))
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Parse date from YYYY-MM-DD string
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

// Check if a specific date is a closed day (holiday, vacation, special closure)
export function isDateClosed(date: Date, closedDays: ClosedDay[]): boolean {
  const dateStr = formatDate(date)
  const month = date.getMonth() + 1
  const day = date.getDate()

  for (const closedDay of closedDays) {
    const closedDateStr = closedDay.date.split('T')[0] // Handle ISO format

    if (closedDay.recurring) {
      // For recurring dates, check only month and day
      const closedDate = new Date(closedDateStr + 'T00:00:00')
      const closedMonth = closedDate.getMonth() + 1
      const closedDayOfMonth = closedDate.getDate()

      if (month === closedMonth && day === closedDayOfMonth) {
        return true
      }
    } else {
      // For non-recurring, check full date
      if (dateStr === closedDateStr) {
        return true
      }
    }
  }

  return false
}

// Get next available dates (excluding closed days AND special closures)
export function getNextAvailableDates(
  startDate: Date,
  count: number = 14,
  openingHours: OpeningHour[] = defaultOpeningHours,
  closedDays: ClosedDay[] = []
): Date[] {
  const dates: Date[] = []
  const current = new Date(startDate)
  // Safety limit to prevent infinite loop
  let iterations = 0
  const maxIterations = count * 4

  while (dates.length < count && iterations < maxIterations) {
    const dayOfWeek = current.getDay()
    const dayHours = openingHours.find((h) => h.dayOfWeek === dayOfWeek)

    // Check both regular hours AND special closures
    if (dayHours && !dayHours.isClosed && !isDateClosed(current, closedDays)) {
      dates.push(new Date(current))
    }

    current.setDate(current.getDate() + 1)
    iterations++
  }

  return dates
}

// Format date for display (Italian locale)
export function formatDateDisplay(date: Date, locale: string = 'it'): string {
  return date.toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Validate booking data
export interface BookingData {
  serviceId: string
  barberId: string
  date: string
  time: string
  clientName: string
  clientEmail: string
  clientPhone: string
  notes?: string
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateBookingData(data: BookingData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.serviceId) {
    errors.serviceId = 'Seleziona un servizio'
  }

  if (!data.barberId) {
    errors.barberId = 'Seleziona un barbiere'
  }

  if (!data.date) {
    errors.date = 'Seleziona una data'
  }

  if (!data.time) {
    errors.time = 'Seleziona un orario'
  }

  if (!data.clientName || data.clientName.trim().length < 2) {
    errors.clientName = 'Inserisci il tuo nome'
  }

  if (data.clientEmail && !isValidEmail(data.clientEmail)) {
    errors.clientEmail = 'Inserisci un\'email valida'
  }

  if (!data.clientPhone || !isValidPhone(data.clientPhone)) {
    errors.clientPhone = 'Inserisci un numero di telefono valido'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  // Accept Italian phone numbers with or without prefix
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')
  return /^(\+39)?[0-9]{9,11}$/.test(cleaned)
}
