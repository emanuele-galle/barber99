'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Search, Filter, X, Bell, FileText, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react'
import { AppointmentActions } from '@/components/admin-panel/AppointmentActions'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  time: string
  status: string
  notes?: string
  service: { name?: string; duration?: number } | null
  barber: string
}

interface AppointmentsClientProps {
  initialAppointments: Appointment[]
}

const statusConfig = {
  pending: { label: 'In attesa', icon: AlertCircle, class: 'admin-badge-warning' },
  confirmed: { label: 'Confermato', icon: CheckCircle, class: 'admin-badge-success' },
  cancelled: { label: 'Annullato', icon: XCircle, class: 'admin-badge-error' },
  completed: { label: 'Completato', icon: CheckCircle, class: 'admin-badge-gold' },
  noshow: { label: 'No Show', icon: XCircle, class: 'admin-badge-error' },
}

export function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const router = useRouter()
  const [appointments] = useState<Appointment[]>(initialAppointments)

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: appointments.length }
    appointments.forEach((apt) => {
      const status = apt.status || 'pending'
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }, [appointments])

  // Dashboard statistics
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0]
      return aptDate === todayStr
    })

    const pendingCount = appointments.filter((apt) => apt.status === 'pending').length
    const confirmedCount = appointments.filter((apt) => apt.status === 'confirmed').length

    // Find appointments starting within the next hour
    const upcomingNow = todayAppointments.filter((apt) => {
      if (apt.status !== 'confirmed' && apt.status !== 'pending') return false
      const [hours, minutes] = apt.time.split(':').map(Number)
      const aptTime = new Date(today)
      aptTime.setHours(hours, minutes, 0, 0)
      return aptTime >= now && aptTime <= oneHourFromNow
    })

    return {
      today: todayAppointments.length,
      pending: pendingCount,
      confirmed: confirmedCount,
      upcomingNow: upcomingNow.length,
      upcomingList: upcomingNow,
    }
  }, [appointments])

  // Check if an appointment is imminent (within 1 hour)
  const isImminent = (apt: Appointment): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const aptDateStr = new Date(apt.date).toISOString().split('T')[0]

    if (aptDateStr !== todayStr) return false
    if (apt.status !== 'confirmed' && apt.status !== 'pending') return false

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const [hours, minutes] = apt.time.split(':').map(Number)
    const aptTime = new Date(today)
    aptTime.setHours(hours, minutes, 0, 0)

    return aptTime >= now && aptTime <= oneHourFromNow
  }

  // Calendar helper functions
  const getWeekDays = (startDate: Date) => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      return d
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      return newDate
    })
  }

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredAppointments.filter(apt =>
      new Date(apt.date).toISOString().split('T')[0] === dateStr
    )
  }

  const getAppointmentPosition = (apt: Appointment) => {
    const [hours, minutes] = apt.time.split(':').map(Number)
    const startMinutes = (hours - 8) * 60 + minutes
    const duration = apt.service?.duration || 30
    return {
      top: startMinutes,
      height: duration
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500/80 border-orange-400'
      case 'confirmed': return 'bg-green-500/80 border-green-400'
      case 'completed': return 'bg-[#d4a855]/80 border-[#d4a855]'
      case 'cancelled':
      case 'noshow': return 'bg-red-500/50 border-red-400 opacity-60'
      default: return 'bg-gray-500/80 border-gray-400'
    }
  }

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter !== 'all' && apt.status !== statusFilter) {
        return false
      }

      // Date filter
      if (dateFilter) {
        const aptDate = new Date(apt.date).toISOString().split('T')[0]
        if (aptDate !== dateFilter) {
          return false
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = apt.clientName?.toLowerCase().includes(query)
        const matchesPhone = apt.clientPhone?.toLowerCase().includes(query)
        const matchesEmail = apt.clientEmail?.toLowerCase().includes(query)
        if (!matchesName && !matchesPhone && !matchesEmail) {
          return false
        }
      }

      return true
    })
  }, [appointments, statusFilter, dateFilter, searchQuery])

  // Calendar derived state
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])
  const todayStr = new Date().toISOString().split('T')[0]

  // Group by date
  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((acc, apt) => {
      const date = new Date(apt.date).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      if (!acc[date]) acc[date] = []
      acc[date].push(apt)
      return acc
    }, {} as Record<string, Appointment[]>)
  }, [filteredAppointments])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFilter('')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Appuntamenti</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Gestisci le prenotazioni dei clienti ({appointments.length} totali)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#d4a855] text-black'
                  : 'bg-[#1a1a1a] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <List className="w-4 h-4" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#d4a855] text-black'
                  : 'bg-[#1a1a1a] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Calendario
            </button>
          </div>
          <button
            onClick={() => router.refresh()}
            className="admin-btn admin-btn-secondary text-sm"
          >
            Aggiorna lista
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#d4a855]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.today}</p>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Oggi</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.pending > 0 ? 'bg-orange-500/20' : 'bg-[rgba(255,255,255,0.05)]'}`}>
              <AlertCircle className={`w-5 h-5 ${stats.pending > 0 ? 'text-orange-400' : 'text-[rgba(255,255,255,0.4)]'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.pending > 0 ? 'text-orange-400' : 'text-white'}`}>{stats.pending}</p>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">In attesa</p>
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Confermati</p>
            </div>
          </div>
        </div>

        {/* Upcoming Now */}
        <div className={`admin-card p-4 ${stats.upcomingNow > 0 ? 'border-red-500/50 animate-pulse' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.upcomingNow > 0 ? 'bg-red-500/20' : 'bg-[rgba(255,255,255,0.05)]'}`}>
              <Bell className={`w-5 h-5 ${stats.upcomingNow > 0 ? 'text-red-400' : 'text-[rgba(255,255,255,0.4)]'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.upcomingNow > 0 ? 'text-red-400' : 'text-white'}`}>{stats.upcomingNow}</p>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Prossima ora</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Tutti' },
          { key: 'pending', label: 'In attesa' },
          { key: 'confirmed', label: 'Confermati' },
          { key: 'completed', label: 'Completati' },
          { key: 'cancelled', label: 'Annullati' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'bg-[#d4a855] text-black'
                : 'bg-[#1a1a1a] text-white hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            {tab.label}
            {statusCounts[tab.key] !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.key
                    ? 'bg-black/20 text-black'
                    : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)]'
                }`}
              >
                {statusCounts[tab.key] || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="admin-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,255,255,0.4)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca cliente (nome, telefono, email)..."
              className="admin-input w-full pl-10"
            />
          </div>

          {/* Date Filter */}
          <div className="sm:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="admin-input w-full"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Cancella filtri
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
            <span className="text-sm text-[rgba(255,255,255,0.5)]">
              {filteredAppointments.length} risultati
            </span>
            {searchQuery && (
              <span className="admin-badge admin-badge-gold text-xs">
                Ricerca: &quot;{searchQuery}&quot;
              </span>
            )}
            {dateFilter && (
              <span className="admin-badge admin-badge-gold text-xs">
                Data: {new Date(dateFilter).toLocaleDateString('it-IT')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Appointments - List or Calendar View */}
      {viewMode === 'list' ? (
        /* LIST VIEW */
        Object.keys(groupedAppointments).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-white mb-3 capitalize flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#d4a855]" />
                  {date}
                  <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                    ({dayAppointments.length})
                  </span>
                </h2>
                <div className="grid gap-3">
                  {dayAppointments.map((appointment) => {
                    const status = statusConfig[(appointment.status as keyof typeof statusConfig) || 'pending']
                    const StatusIcon = status.icon
                    const imminent = isImminent(appointment)

                    return (
                      <div
                        key={appointment.id}
                        className={`admin-card p-4 flex flex-col gap-4 transition-all ${
                          imminent ? 'border-[#d4a855] ring-2 ring-[#d4a855]/30 shadow-[0_0_20px_rgba(212,168,85,0.2)]' : ''
                        }`}
                      >
                        {/* Top row: Time, Customer, Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-3 sm:w-28 flex-shrink-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              imminent ? 'bg-[#d4a855]/20 animate-pulse' : 'bg-[rgba(212,168,85,0.1)]'
                            }`}>
                              <Clock className={`w-5 h-5 ${imminent ? 'text-[#d4a855]' : 'text-[#d4a855]'}`} />
                            </div>
                            <div>
                              <span className="text-xl font-bold text-white">
                                {appointment.time}
                              </span>
                              {imminent && (
                                <span className="block text-xs text-[#d4a855] font-medium">
                                  Imminente
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Customer info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-[rgba(255,255,255,0.5)]" />
                              <span className="font-medium text-white">
                                {appointment.clientName}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[rgba(255,255,255,0.5)]">
                              <a
                                href={`tel:${appointment.clientPhone}`}
                                className="flex items-center gap-1.5 hover:text-[#d4a855] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{appointment.clientPhone}</span>
                              </a>
                              <a
                                href={`mailto:${appointment.clientEmail}`}
                                className="flex items-center gap-1.5 hover:text-[#d4a855] transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[180px]">{appointment.clientEmail}</span>
                              </a>
                            </div>
                          </div>

                          {/* Service & Barber */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="admin-badge admin-badge-gold">
                              {appointment.service?.name || 'Servizio'}
                            </span>
                            {appointment.service?.duration && (
                              <span className="text-xs text-[rgba(255,255,255,0.4)]">
                                {appointment.service.duration} min
                              </span>
                            )}
                            {appointment.barber && (
                              <span className="text-sm text-[rgba(255,255,255,0.5)]">
                                con {appointment.barber}
                              </span>
                            )}
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-3">
                            <span className={`admin-badge ${status.class} flex items-center gap-1`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.label}
                            </span>
                            <AppointmentActions
                              appointmentId={String(appointment.id)}
                              currentStatus={appointment.status as string}
                              clientEmail={appointment.clientEmail}
                              clientName={appointment.clientName}
                            />
                          </div>
                        </div>

                        {/* Notes row (if present) */}
                        {appointment.notes && (
                          <div className="flex items-start gap-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                            <FileText className="w-4 h-4 text-[rgba(255,255,255,0.4)] mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-[rgba(255,255,255,0.6)] italic">
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
              <Calendar className="w-8 h-8 text-[#d4a855]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {hasActiveFilters ? 'Nessun risultato' : 'Nessun appuntamento'}
            </h3>
            <p className="text-[rgba(255,255,255,0.5)]">
              {hasActiveFilters
                ? 'Prova a modificare i filtri di ricerca'
                : 'Non ci sono appuntamenti programmati'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 admin-btn admin-btn-secondary"
              >
                Cancella filtri
              </button>
            )}
          </div>
        )
      ) : (
        /* CALENDAR VIEW */
        <div className="admin-card overflow-hidden">
          {/* Calendar Header - Week Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">
                {weekDays[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h2>
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.1)]">
                <div className="p-2 text-center text-xs text-[rgba(255,255,255,0.4)] font-medium border-r border-[rgba(255,255,255,0.05)]">
                  Ora
                </div>
                {weekDays.map((day, i) => {
                  const dayStr = day.toISOString().split('T')[0]
                  const isToday = dayStr === todayStr
                  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
                  return (
                    <div
                      key={i}
                      className={`p-2 text-center border-r border-[rgba(255,255,255,0.05)] last:border-r-0 ${
                        isToday ? 'bg-[#d4a855]/10' : ''
                      }`}
                    >
                      <div className={`text-xs font-medium ${isToday ? 'text-[#d4a855]' : 'text-[rgba(255,255,255,0.4)]'}`}>
                        {dayNames[day.getDay()]}
                      </div>
                      <div className={`text-sm font-bold ${isToday ? 'text-[#d4a855]' : 'text-white'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {/* Hour lines - 8:00 to 20:00 */}
                {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.05)]" style={{ height: '60px' }}>
                    <div className="p-1 text-right pr-2 text-xs text-[rgba(255,255,255,0.4)] border-r border-[rgba(255,255,255,0.05)]">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayStr = day.toISOString().split('T')[0]
                      const isToday = dayStr === todayStr
                      return (
                        <div
                          key={dayIndex}
                          className={`relative border-r border-[rgba(255,255,255,0.05)] last:border-r-0 ${
                            isToday ? 'bg-[#d4a855]/5' : ''
                          }`}
                        />
                      )
                    })}
                  </div>
                ))}

                {/* Appointments Overlay */}
                <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                  <div /> {/* Time column placeholder */}
                  {weekDays.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDay(day)
                    return (
                      <div key={dayIndex} className="relative">
                        {dayAppointments.map((apt) => {
                          const pos = getAppointmentPosition(apt)
                          const status = statusConfig[(apt.status as keyof typeof statusConfig) || 'pending']
                          return (
                            <div
                              key={apt.id}
                              className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-xs cursor-pointer pointer-events-auto border-l-2 overflow-hidden transition-transform hover:scale-105 hover:z-10 ${getStatusColor(apt.status)}`}
                              style={{
                                top: `${pos.top}px`,
                                height: `${Math.max(pos.height, 24)}px`,
                              }}
                              title={`${apt.time} - ${apt.clientName}\n${apt.service?.name || 'Servizio'}\n${status.label}`}
                              onClick={() => {
                                // Future: open detail modal
                              }}
                            >
                              <div className="font-medium text-white truncate text-[10px]">
                                {apt.time}
                              </div>
                              {pos.height >= 40 && (
                                <div className="text-white/80 truncate text-[10px]">
                                  {apt.clientName}
                                </div>
                              )}
                              {pos.height >= 55 && (
                                <div className="text-white/60 truncate text-[9px]">
                                  {apt.service?.name}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.1)] flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500/80 border-l-2 border-orange-400" />
              <span className="text-[rgba(255,255,255,0.5)]">In attesa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500/80 border-l-2 border-green-400" />
              <span className="text-[rgba(255,255,255,0.5)]">Confermato</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#d4a855]/80 border-l-2 border-[#d4a855]" />
              <span className="text-[rgba(255,255,255,0.5)]">Completato</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/50 border-l-2 border-red-400 opacity-60" />
              <span className="text-[rgba(255,255,255,0.5)]">Annullato/No Show</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
