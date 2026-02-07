'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Search, Filter, X, Bell, FileText, ChevronLeft, ChevronRight, List, CalendarDays, UserX, Plus } from 'lucide-react'
import { AppointmentActions } from '@/components/admin-panel/AppointmentActions'
import { useToast } from '@/components/Toast'

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
  const { showToast } = useToast()
  const [appointments] = useState<Appointment[]>(initialAppointments)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentDay, setCurrentDay] = useState(() => new Date()) // For mobile day view
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })
  const [jumpToDate, setJumpToDate] = useState('') // date picker value

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Quick action handlers
  const handleQuickAction = async (id: string, status: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Errore')
      const messages: Record<string, string> = {
        completed: 'Completato',
        noshow: 'Segnato No-Show',
      }
      showToast('success', messages[status] || 'Aggiornato', 'OK')
      router.refresh()
    } catch {
      showToast('error', 'Errore durante aggiornamento', 'Errore')
    } finally {
      setActionLoading(null)
    }
  }

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: appointments.length }
    appointments.forEach((apt) => {
      const status = apt.status || 'confirmed'
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

    const confirmedCount = appointments.filter((apt) => apt.status === 'confirmed').length
    const completedCount = appointments.filter((apt) => apt.status === 'completed').length

    // Find appointments starting within the next hour
    const upcomingNow = todayAppointments.filter((apt) => {
      if (apt.status !== 'confirmed') return false
      const [hours, minutes] = apt.time.split(':').map(Number)
      const aptTime = new Date(today)
      aptTime.setHours(hours, minutes, 0, 0)
      return aptTime >= now && aptTime <= oneHourFromNow
    })

    return {
      today: todayAppointments.length,
      confirmed: confirmedCount,
      completed: completedCount,
      upcomingNow: upcomingNow.length,
    }
  }, [appointments])

  // Check if an appointment is imminent (within 1 hour)
  const isImminent = (apt: Appointment): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]
    const aptDateStr = new Date(apt.date).toISOString().split('T')[0]

    if (aptDateStr !== todayStr) return false
    if (apt.status !== 'confirmed') return false

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

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDay(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const handleJumpToDate = (dateStr: string) => {
    setJumpToDate(dateStr)
    if (dateStr) {
      const date = new Date(dateStr + 'T00:00:00')
      setCurrentDay(date)
      // Also update week start for desktop calendar
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(date)
      weekStart.setDate(diff)
      setCurrentWeekStart(weekStart)
      // Set date filter to jump in list view
      setDateFilter(dateStr)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDay(today)
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(today)
    weekStart.setDate(diff)
    setCurrentWeekStart(weekStart)
    setDateFilter(today.toISOString().split('T')[0])
    setJumpToDate('')
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

  // Filter and sort appointments chronologically
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((apt) => {
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false
      if (dateFilter) {
        const aptDate = new Date(apt.date).toISOString().split('T')[0]
        if (aptDate !== dateFilter) return false
      }
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase()
        const matchesName = apt.clientName?.toLowerCase().includes(query)
        const matchesPhone = apt.clientPhone?.toLowerCase().includes(query)
        const matchesEmail = apt.clientEmail?.toLowerCase().includes(query)
        if (!matchesName && !matchesPhone && !matchesEmail) return false
      }
      return true
    })
    // Sort by date ascending, then by time ascending
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateA - dateB
      return (a.time || '').localeCompare(b.time || '')
    })
    return filtered
  }, [appointments, statusFilter, dateFilter, debouncedSearchQuery])

  // Calendar derived state
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])
  const todayStr = new Date().toISOString().split('T')[0]

  // Group by date (already sorted chronologically from filteredAppointments)
  const groupedAppointments = useMemo(() => {
    const groups: { label: string; sortKey: string; appointments: Appointment[] }[] = []
    const groupMap = new Map<string, number>()

    filteredAppointments.forEach((apt) => {
      const sortKey = new Date(apt.date).toISOString().split('T')[0]
      const label = new Date(apt.date).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      if (groupMap.has(sortKey)) {
        groups[groupMap.get(sortKey)!].appointments.push(apt)
      } else {
        groupMap.set(sortKey, groups.length)
        groups.push({ label, sortKey, appointments: [apt] })
      }
    })

    // Sort groups chronologically
    groups.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    return groups
  }, [filteredAppointments])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFilter('')
  }

  const hasActiveFilters = debouncedSearchQuery || statusFilter !== 'all' || dateFilter

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
          {/* New appointment */}
          <Link
            href="/admin-panel/appuntamenti/nuovo"
            className="admin-btn admin-btn-primary text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuovo</span>
          </Link>
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

        {/* Completed */}
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#d4a855]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">Completati</p>
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
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1">
        {[
          { key: 'all', label: 'Tutti' },
          { key: 'confirmed', label: 'Confermati' },
          { key: 'completed', label: 'Completati' },
          { key: 'cancelled', label: 'Annullati' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
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

      {/* Quick Navigation Bar */}
      <div className="admin-card p-3 flex flex-wrap items-center gap-2">
        <button onClick={goToToday} className="px-3 py-1.5 rounded-lg bg-[#d4a855]/10 text-[#d4a855] text-sm font-medium hover:bg-[#d4a855]/20 transition-colors">
          Oggi
        </button>
        <button
          onClick={() => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            handleJumpToDate(tomorrow.toISOString().split('T')[0])
          }}
          className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-white text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          Domani
        </button>
        <div className="flex-1" />
        <input
          type="date"
          value={jumpToDate}
          onChange={(e) => handleJumpToDate(e.target.value)}
          className="admin-input text-sm py-1.5"
          title="Salta a data"
        />
      </div>

      {/* Mobile Calendar View (< lg) */}
      <div className="lg:hidden">
        {viewMode === 'calendar' && (
          <div className="admin-card overflow-hidden">
            {/* Day navigation header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.1)]">
              <button onClick={() => navigateDay('prev')} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white capitalize">
                  {currentDay.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                {currentDay.toISOString().split('T')[0] === todayStr && (
                  <span className="text-xs text-[#d4a855]">Oggi</span>
                )}
              </div>
              <button onClick={() => navigateDay('next')} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Day timeline */}
            <div className="p-4 space-y-2">
              {(() => {
                const dayApts = getAppointmentsForDay(currentDay)
                if (dayApts.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-[rgba(255,255,255,0.2)] mx-auto mb-2" />
                      <p className="text-[rgba(255,255,255,0.4)] text-sm">Nessun appuntamento</p>
                    </div>
                  )
                }
                return dayApts
                  .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                  .map((apt) => {
                    const aptStatus = statusConfig[(apt.status as keyof typeof statusConfig) || 'confirmed']
                    const StatusIcon = aptStatus.icon
                    return (
                      <Link
                        key={apt.id}
                        href={`/admin-panel/appuntamenti/${apt.id}/modifica`}
                        className={`block p-3 rounded-lg border transition-colors hover:border-[#d4a855]/30 ${
                          isImminent(apt) ? 'border-[#d4a855] bg-[#d4a855]/5' : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[rgba(212,168,85,0.1)] flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-[#d4a855]">{apt.time}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">{apt.clientName}</span>
                              <span className={`admin-badge ${aptStatus.class} text-[10px] flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {aptStatus.label}
                              </span>
                            </div>
                            <p className="text-xs text-[rgba(255,255,255,0.5)]">
                              {apt.service?.name} {apt.service?.duration && `- ${apt.service.duration} min`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Appointments - List or Calendar View */}
      {viewMode === 'list' || typeof window !== 'undefined' ? (
        /* LIST VIEW */
        viewMode === 'list' ? (
          groupedAppointments.length > 0 ? (
            <div className="space-y-6">
              {groupedAppointments.map((group) => (
                <div key={group.sortKey}>
                  <h2 className="text-lg font-semibold text-white mb-3 capitalize flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#d4a855]" />
                    {group.label}
                    <span className="text-sm font-normal text-[rgba(255,255,255,0.5)]">
                      ({group.appointments.length})
                    </span>
                  </h2>
                  <div className="grid gap-3">
                    {group.appointments.map((appointment) => {
                      const status = statusConfig[(appointment.status as keyof typeof statusConfig) || 'confirmed']
                      const StatusIcon = status.icon
                      const imminent = isImminent(appointment)
                      const isActive = appointment.status === 'confirmed'

                      return (
                        <div
                          key={appointment.id}
                          className={`admin-card p-4 transition-all ${
                            imminent ? 'border-[#d4a855] ring-2 ring-[#d4a855]/30 shadow-[0_0_20px_rgba(212,168,85,0.2)]' : ''
                          }`}
                        >
                          {/* Mobile-optimized layout */}
                          <div className="flex items-start gap-3">
                            {/* Time badge */}
                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                              imminent ? 'bg-[#d4a855]/20 animate-pulse' : 'bg-[rgba(212,168,85,0.1)]'
                            }`}>
                              <span className="text-base font-bold text-[#d4a855] leading-tight">
                                {appointment.time}
                              </span>
                              {imminent && (
                                <span className="text-[9px] text-[#d4a855] font-medium">
                                  Ora!
                                </span>
                              )}
                            </div>

                            {/* Main info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white truncate">
                                  {appointment.clientName}
                                </span>
                                <span className={`admin-badge ${status.class} flex items-center gap-1 text-xs`}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{status.label}</span>
                                </span>
                              </div>

                              {/* Service */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="admin-badge admin-badge-gold text-xs">
                                  {appointment.service?.name || 'Servizio'}
                                </span>
                                {appointment.service?.duration && (
                                  <span className="text-xs text-[rgba(255,255,255,0.4)]">
                                    {appointment.service.duration} min
                                  </span>
                                )}
                              </div>

                              {/* Contact + Quick actions row */}
                              <div className="flex items-center justify-between gap-2">
                                {/* Contact buttons */}
                                <div className="flex items-center gap-2">
                                  {appointment.clientPhone && (
                                    <>
                                      <a
                                        href={`tel:${appointment.clientPhone}`}
                                        className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] hover:text-[#d4a855] transition-colors"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">{appointment.clientPhone}</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/${appointment.clientPhone.replace(/\s+/g, '').replace(/^\+/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                                        title="WhatsApp"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                      </a>
                                    </>
                                  )}
                                  {appointment.clientEmail && (
                                    <a
                                      href={`mailto:${appointment.clientEmail}`}
                                      className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.5)] hover:text-[#d4a855] transition-colors hidden sm:flex"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                      <span className="truncate max-w-[140px]">{appointment.clientEmail}</span>
                                    </a>
                                  )}
                                </div>

                                {/* Inline quick actions for confirmed appointments */}
                                <div className="flex items-center gap-2">
                                  {isActive && (
                                    <>
                                      <button
                                        onClick={() => handleQuickAction(appointment.id, 'completed')}
                                        disabled={actionLoading === appointment.id}
                                        className="px-3 py-1.5 min-h-[36px] rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1"
                                        title="Completa"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Completa</span>
                                      </button>
                                      <button
                                        onClick={() => handleQuickAction(appointment.id, 'noshow')}
                                        disabled={actionLoading === appointment.id}
                                        className="px-3 py-1.5 min-h-[36px] rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1"
                                        title="No-show"
                                      >
                                        <UserX className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">No-show</span>
                                      </button>
                                    </>
                                  )}
                                  <AppointmentActions
                                    appointmentId={String(appointment.id)}
                                    currentStatus={appointment.status as string}
                                    clientEmail={appointment.clientEmail}
                                    clientName={appointment.clientName}
                                    clientPhone={appointment.clientPhone}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes row (if present) */}
                          {appointment.notes && (
                            <div className="flex items-start gap-2 pt-3 mt-3 border-t border-[rgba(255,255,255,0.05)] ml-[68px]">
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
          /* CALENDAR VIEW (desktop only) */
          <div className="admin-card overflow-hidden hidden lg:block">
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
                            const aptStatus = statusConfig[(apt.status as keyof typeof statusConfig) || 'confirmed']
                            return (
                              <div
                                key={apt.id}
                                className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-xs cursor-pointer pointer-events-auto border-l-2 overflow-hidden transition-transform hover:scale-105 hover:z-10 ${getStatusColor(apt.status)}`}
                                style={{
                                  top: `${pos.top}px`,
                                  height: `${Math.max(pos.height, 24)}px`,
                                }}
                                title={`${apt.time} - ${apt.clientName}\n${apt.service?.name || 'Servizio'}\n${aptStatus.label}`}
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
        )
      ) : null}
    </div>
  )
}
