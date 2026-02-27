'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  X,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  List,
  CalendarDays,
  UserX,
  Plus,
  Loader2,
  SlidersHorizontal,
  Trash2,
  CheckSquare,
} from 'lucide-react'
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

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; class: string }> = {
  pending: { label: 'Attesa', icon: AlertCircle, class: 'admin-badge-warning' },
  confirmed: { label: 'Confermato', icon: CheckCircle, class: 'admin-badge-success' },
  cancelled: { label: 'Annullato', icon: XCircle, class: 'admin-badge-error' },
  completed: { label: 'Completato', icon: CheckCircle, class: 'admin-badge-gold' },
  noshow: { label: 'No Show', icon: XCircle, class: 'admin-badge-error' },
}

function formatDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function AppointmentsClient() {
  const { showToast } = useToast()
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast

  // Data state
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Date range (default: today + 7 days)
  const [dateFrom, setDateFrom] = useState(() => formatDateStr(new Date()))
  const [dateTo, setDateTo] = useState(() => formatDateStr(addDays(new Date(), 30)))

  // View mode - calendar default on mobile
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return 'calendar'
    return 'list'
  })
  const [currentDay, setCurrentDay] = useState(() => new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const t = new Date()
    const day = t.getDay()
    const diff = t.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(t.setDate(diff))
  })

  // Filters (collapsed by default on mobile)
  const [filtersOpen, setFiltersOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return false
    return true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // Bulk delete state
  const canDeletePast = process.env.NEXT_PUBLIC_ENABLE_DELETE_PAST === 'true'
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/appointments?from=${dateFrom}&to=${dateTo}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      setAppointments(data.appointments)
    } catch {
      showToastRef.current('error', 'Errore caricamento appuntamenti', 'Errore')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Quick action handler
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
      showToast('success', status === 'completed' ? 'Completato' : 'No-Show', 'OK')
      fetchAppointments()
    } catch {
      showToast('error', 'Errore aggiornamento', 'Errore')
    } finally {
      setActionLoading(null)
    }
  }

  // Bulk delete helpers
  const isPast = (apt: Appointment): boolean => {
    const d = new Date(apt.date)
    d.setHours(0, 0, 0, 0)
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const exitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedIds(new Set())
    setShowBulkConfirm(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      const res = await fetch('/api/appointments/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Errore')
      const data = await res.json()
      showToast('success', `${data.deleted} appuntamenti eliminati`, 'OK')
      if (data.errors?.length > 0) {
        console.warn('Bulk delete errors:', data.errors)
      }
      exitSelectionMode()
      fetchAppointments()
    } catch {
      showToast('error', 'Errore eliminazione', 'Errore')
    } finally {
      setBulkDeleting(false)
      setShowBulkConfirm(false)
    }
  }

  // Quick date range buttons
  const setQuickRange = (label: string) => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    switch (label) {
      case 'oggi':
        setDateFrom(formatDateStr(t))
        setDateTo(formatDateStr(t))
        break
      case 'domani': {
        const tom = addDays(t, 1)
        setDateFrom(formatDateStr(tom))
        setDateTo(formatDateStr(tom))
        break
      }
      case 'settimana':
        setDateFrom(formatDateStr(t))
        setDateTo(formatDateStr(addDays(t, 7)))
        break
      case 'mese':
        setDateFrom(formatDateStr(t))
        setDateTo(formatDateStr(addDays(t, 30)))
        break
    }
  }

  // Stats (computed from loaded appointments)
  const stats = useMemo(() => {
    const todayStr = formatDateStr(new Date())
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

    let todayCount = 0
    let confirmedCount = 0
    let completedCount = 0
    let upcomingCount = 0

    for (const apt of appointments) {
      const aptDate = formatDateStr(new Date(apt.date))
      if (aptDate === todayStr) {
        todayCount++
        if (apt.status === 'confirmed') {
          const [h, m] = apt.time.split(':').map(Number)
          const aptTime = new Date()
          aptTime.setHours(h, m, 0, 0)
          if (aptTime >= now && aptTime <= oneHourLater) upcomingCount++
        }
      }
      if (apt.status === 'confirmed') confirmedCount++
      if (apt.status === 'completed') completedCount++
    }
    return { today: todayCount, confirmed: confirmedCount, completed: completedCount, upcoming: upcomingCount }
  }, [appointments])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: appointments.length, active: 0 }
    for (const apt of appointments) {
      const s = apt.status || 'confirmed'
      counts[s] = (counts[s] || 0) + 1
      if (s !== 'cancelled' && s !== 'noshow') counts.active++
    }
    return counts
  }, [appointments])

  // Is imminent
  const isImminent = (apt: Appointment): boolean => {
    const todayStr = formatDateStr(new Date())
    const aptDate = formatDateStr(new Date(apt.date))
    if (aptDate !== todayStr || apt.status !== 'confirmed') return false
    const now = new Date()
    const oneHour = new Date(now.getTime() + 60 * 60 * 1000)
    const [h, m] = apt.time.split(':').map(Number)
    const aptTime = new Date()
    aptTime.setHours(h, m, 0, 0)
    return aptTime >= now && aptTime <= oneHour
  }

  // Filter & sort
  const filteredAppointments = useMemo(() => {
    const filtered = appointments.filter((apt) => {
      if (statusFilter === 'active') {
        if (apt.status === 'cancelled' || apt.status === 'noshow') return false
      } else if (statusFilter !== 'all' && apt.status !== statusFilter) return false
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        if (
          !apt.clientName?.toLowerCase().includes(q) &&
          !apt.clientPhone?.toLowerCase().includes(q) &&
          !apt.clientEmail?.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
    filtered.sort((a, b) => {
      const da = new Date(a.date).getTime()
      const db = new Date(b.date).getTime()
      if (da !== db) return da - db
      return (a.time || '').localeCompare(b.time || '')
    })
    return filtered
  }, [appointments, statusFilter, debouncedSearch])

  // Group by date
  const groupedAppointments = useMemo(() => {
    const groups: { label: string; sortKey: string; isToday: boolean; appointments: Appointment[] }[] = []
    const map = new Map<string, number>()
    const todayStr = formatDateStr(new Date())
    const tomorrowStr = formatDateStr(addDays(new Date(), 1))

    for (const apt of filteredAppointments) {
      const sortKey = formatDateStr(new Date(apt.date))
      let label = new Date(apt.date).toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      if (sortKey === todayStr) label = `Oggi - ${label}`
      else if (sortKey === tomorrowStr) label = `Domani - ${label}`

      if (map.has(sortKey)) {
        groups[map.get(sortKey)!].appointments.push(apt)
      } else {
        map.set(sortKey, groups.length)
        groups.push({ label, sortKey, isToday: sortKey === todayStr, appointments: [apt] })
      }
    }
    groups.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    return groups
  }, [filteredAppointments])

  // Calendar helpers
  const getWeekDays = (start: Date) =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })

  const navigateWeek = (dir: 'prev' | 'next') => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + (dir === 'next' ? 7 : -7))
      const weekEnd = addDays(d, 6)
      setDateFrom(formatDateStr(d))
      setDateTo(formatDateStr(weekEnd))
      return d
    })
  }

  const navigateDay = (dir: 'prev' | 'next') => {
    setCurrentDay((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + (dir === 'next' ? 1 : -1))
      setDateFrom(formatDateStr(addDays(d, -3)))
      setDateTo(formatDateStr(addDays(d, 3)))
      return d
    })
  }

  const goToToday = () => {
    const t = new Date()
    setCurrentDay(t)
    const day = t.getDay()
    const diff = t.getDate() - day + (day === 0 ? -6 : 1)
    const ws = new Date(t)
    ws.setDate(diff)
    setCurrentWeekStart(ws)
    setDateFrom(formatDateStr(ws))
    setDateTo(formatDateStr(addDays(ws, 6)))
  }

  const getAppointmentsForDay = (date: Date) => {
    const ds = formatDateStr(date)
    return filteredAppointments.filter((apt) => formatDateStr(new Date(apt.date)) === ds)
  }

  const getAppointmentPosition = (apt: Appointment) => {
    const [h, m] = apt.time.split(':').map(Number)
    return { top: (h - 8) * 60 + m, height: apt.service?.duration || 30 }
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

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])
  const todayStr = formatDateStr(new Date())

  const hasActiveFilters = debouncedSearch || (statusFilter !== 'all' && statusFilter !== 'active')

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('active')
  }

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Appuntamenti</h1>
          <p className="text-[rgba(255,255,255,0.5)] text-sm">
            {loading ? 'Caricamento...' : `${appointments.length} appuntamenti`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canDeletePast && !selectionMode && (
            <button
              onClick={() => setSelectionMode(true)}
              className="admin-btn admin-btn-secondary text-sm flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              Seleziona
            </button>
          )}
          {selectionMode && (
            <button
              onClick={exitSelectionMode}
              className="admin-btn admin-btn-secondary text-sm flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Annulla
            </button>
          )}
          <Link
            href="/admin-panel/appuntamenti/nuovo"
            className="admin-btn admin-btn-primary text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuovo</span>
          </Link>
          <div className="flex rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-[#d4a855] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors ${
                viewMode === 'calendar' ? 'bg-[#d4a855] text-black' : 'bg-[#1a1a1a] text-white hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Stats Bar */}
      <div className="admin-card p-2.5 flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(212,168,85,0.1)] flex-shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#d4a855]" />
          <span className="text-sm font-bold text-white">{stats.today}</span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Oggi</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0 ${
          stats.upcoming > 0 ? 'bg-red-500/15 animate-pulse' : 'bg-[rgba(255,255,255,0.03)]'
        }`}>
          <Bell className={`w-3.5 h-3.5 ${stats.upcoming > 0 ? 'text-red-400' : 'text-[rgba(255,255,255,0.4)]'}`} />
          <span className={`text-sm font-bold ${stats.upcoming > 0 ? 'text-red-400' : 'text-white'}`}>{stats.upcoming}</span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Prossima ora</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 flex-shrink-0">
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          <span className="text-sm font-bold text-white">{stats.confirmed}</span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Confermati</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(212,168,85,0.08)] flex-shrink-0">
          <CheckCircle className="w-3.5 h-3.5 text-[#d4a855]" />
          <span className="text-sm font-bold text-white">{stats.completed}</span>
          <span className="text-xs text-[rgba(255,255,255,0.5)]">Completati</span>
        </div>
      </div>

      {/* Filters Toggle (mobile) + Filter Bar */}
      <div className="admin-card overflow-hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full p-2.5 flex items-center justify-between lg:hidden"
        >
          <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtri</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#d4a855]" />
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-[rgba(255,255,255,0.4)] transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-2.5 pt-0 lg:pt-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca cliente..."
                  className="admin-input w-full pl-8 py-1.5 text-sm"
                />
              </div>

              {/* Status tabs inline */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { key: 'active', label: 'Attivi' },
                  { key: 'all', label: 'Tutti' },
                  { key: 'confirmed', label: 'Confermati' },
                  { key: 'completed', label: 'Completati' },
                  { key: 'cancelled', label: 'Annullati' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      statusFilter === tab.key
                        ? 'bg-[#d4a855] text-black'
                        : 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.1)]'
                    }`}
                  >
                    {tab.label}
                    {statusCounts[tab.key] != null && (
                      <span className={`ml-1 ${statusFilter === tab.key ? 'text-black/60' : 'text-[rgba(255,255,255,0.4)]'}`}>
                        {statusCounts[tab.key] || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Date Range & Quick Buttons */}
          <div className="p-2.5 pt-0 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setQuickRange('oggi')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                dateFrom === todayStr && dateTo === todayStr
                  ? 'bg-[#d4a855] text-black'
                  : 'bg-[#d4a855]/10 text-[#d4a855] hover:bg-[#d4a855]/20'
              }`}
            >
              Oggi
            </button>
            <button
              onClick={() => setQuickRange('domani')}
              className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-white text-xs hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              Domani
            </button>
            <button
              onClick={() => setQuickRange('settimana')}
              className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-white text-xs hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              7 Giorni
            </button>
            <button
              onClick={() => setQuickRange('mese')}
              className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.05)] text-white text-xs hover:bg-[rgba(255,255,255,0.1)] transition-colors"
            >
              30 Giorni
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.5)]">
              <span>Da</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="admin-input text-xs py-1 px-2"
              />
              <span>a</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="admin-input text-xs py-1 px-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="admin-card p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#d4a855] mx-auto mb-2" />
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Caricamento appuntamenti...</p>
        </div>
      )}

      {/* Mobile Calendar View */}
      {!loading && viewMode === 'calendar' && (
        <div className="lg:hidden">
          <div className="admin-card overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.1)]">
              <button onClick={() => navigateDay('prev')} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-semibold text-white capitalize">
                  {currentDay.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                {formatDateStr(currentDay) === todayStr && (
                  <span className="text-[10px] text-[#d4a855]">Oggi</span>
                )}
              </div>
              <button onClick={() => navigateDay('next')} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {(() => {
                const dayApts = getAppointmentsForDay(currentDay)
                if (dayApts.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <Calendar className="w-6 h-6 text-[rgba(255,255,255,0.2)] mx-auto mb-1" />
                      <p className="text-[rgba(255,255,255,0.4)] text-xs">Nessun appuntamento</p>
                    </div>
                  )
                }
                return dayApts.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map((apt) => {
                  const s = statusConfig[apt.status] || statusConfig.confirmed
                  const SIcon = s.icon
                  return (
                    <Link
                      key={apt.id}
                      href={`/admin-panel/appuntamenti/${apt.id}/modifica`}
                      className={`block p-2.5 rounded-lg border transition-colors hover:border-[#d4a855]/30 ${
                        isImminent(apt) ? 'border-[#d4a855] bg-[#d4a855]/5' : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,85,0.1)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#d4a855]">{apt.time}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-white truncate">{apt.clientName}</span>
                            <span className={`admin-badge ${s.class} text-[9px] flex items-center gap-0.5 py-0 px-1.5`}>
                              <SIcon className="w-2.5 h-2.5" />
                              {s.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[rgba(255,255,255,0.5)]">
                            {apt.service?.name} {apt.service?.duration && `- ${apt.service.duration}min`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {!loading && viewMode === 'list' && (
        groupedAppointments.length > 0 ? (
          <div className="space-y-4">
            {groupedAppointments.map((group) => (
              <div key={group.sortKey}>
                <h2 className={`text-sm font-semibold mb-2 capitalize flex items-center gap-1.5 ${
                  group.isToday ? 'text-[#d4a855]' : 'text-white'
                }`}>
                  <Calendar className="w-4 h-4" />
                  {group.label}
                  <span className="text-xs font-normal text-[rgba(255,255,255,0.4)]">
                    ({group.appointments.length})
                  </span>
                </h2>
                <div className="space-y-1.5">
                  {group.appointments.map((apt) => {
                    const s = statusConfig[apt.status] || statusConfig.confirmed
                    const SIcon = s.icon
                    const imminent = isImminent(apt)
                    const isActive = apt.status === 'confirmed'

                    const pastApt = isPast(apt)

                    return (
                      <div
                        key={apt.id}
                        className={`admin-card p-2.5 transition-all ${
                          imminent ? 'border-[#d4a855] ring-1 ring-[#d4a855]/30' : ''
                        } ${selectionMode && pastApt && selectedIds.has(apt.id) ? 'ring-1 ring-red-400/50 border-red-400/30' : ''}`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Selection checkbox */}
                          {selectionMode && pastApt && (
                            <button
                              onClick={() => toggleSelection(apt.id)}
                              className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                selectedIds.has(apt.id)
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'border-[rgba(255,255,255,0.3)] hover:border-red-400'
                              }`}
                            >
                              {selectedIds.has(apt.id) && <CheckCircle className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {selectionMode && !pastApt && (
                            <div className="w-5 h-5 flex-shrink-0" />
                          )}
                          {/* Time */}
                          <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                            imminent ? 'bg-[#d4a855]/20' : 'bg-[rgba(212,168,85,0.1)]'
                          }`}>
                            <span className="text-sm font-bold text-[#d4a855] leading-tight">{apt.time}</span>
                            {imminent && <span className="text-[8px] text-[#d4a855]">ORA</span>}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-white truncate">{apt.clientName}</span>
                              <span className={`admin-badge ${s.class} text-[9px] flex items-center gap-0.5 py-0 px-1.5`}>
                                <SIcon className="w-2.5 h-2.5" />
                                <span className="hidden sm:inline">{s.label}</span>
                              </span>
                              {apt.service && (
                                <span className="text-[11px] text-[rgba(255,255,255,0.4)] hidden sm:inline">
                                  {apt.service.name} {apt.service.duration && `(${apt.service.duration}min)`}
                                </span>
                              )}
                            </div>
                            {/* Mobile service line */}
                            <p className="text-[11px] text-[rgba(255,255,255,0.4)] sm:hidden">
                              {apt.service?.name} {apt.service?.duration && `- ${apt.service.duration}min`}
                            </p>
                          </div>

                          {/* Contact icons */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {apt.clientPhone && (
                              <a
                                href={`tel:${apt.clientPhone}`}
                                className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
                                title={apt.clientPhone}
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {apt.clientEmail && (
                              <a
                                href={`mailto:${apt.clientEmail}`}
                                className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors hidden sm:block"
                                title={apt.clientEmail}
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {apt.notes && (
                              <button
                                onClick={() => toggleNotes(apt.id)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  expandedNotes.has(apt.id)
                                    ? 'bg-[#d4a855]/10 text-[#d4a855]'
                                    : 'hover:bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)] hover:text-white'
                                }`}
                                title="Note"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isActive && (
                              <>
                                <button
                                  onClick={() => handleQuickAction(apt.id, 'completed')}
                                  disabled={actionLoading === apt.id}
                                  className="p-1.5 rounded-md bg-green-500/15 hover:bg-green-500/25 text-green-400 transition-all disabled:opacity-50"
                                  title="Completa"
                                >
                                  {actionLoading === apt.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleQuickAction(apt.id, 'noshow')}
                                  disabled={actionLoading === apt.id}
                                  className="p-1.5 rounded-md bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 transition-all disabled:opacity-50"
                                  title="No-show"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <AppointmentActions
                              appointmentId={apt.id}
                              currentStatus={apt.status}
                              clientEmail={apt.clientEmail}
                              clientName={apt.clientName}
                              clientPhone={apt.clientPhone}
                            />
                          </div>
                        </div>

                        {/* Expanded notes */}
                        {apt.notes && expandedNotes.has(apt.id) && (
                          <div className="mt-2 ml-[52px] px-2.5 py-1.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
                            <p className="text-xs text-[rgba(255,255,255,0.6)] italic">{apt.notes}</p>
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
          <div className="admin-card p-8 text-center">
            <Calendar className="w-8 h-8 text-[rgba(255,255,255,0.2)] mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">
              {hasActiveFilters ? 'Nessun risultato' : 'Nessun appuntamento'}
            </h3>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">
              {hasActiveFilters ? 'Modifica i filtri di ricerca' : 'Nessun appuntamento nel periodo selezionato'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 admin-btn admin-btn-secondary text-xs">
                Reset filtri
              </button>
            )}
          </div>
        )
      )}

      {/* CALENDAR VIEW (desktop) */}
      {!loading && viewMode === 'calendar' && (
        <div className="admin-card overflow-hidden hidden lg:block">
          <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.1)]">
            <button onClick={() => navigateWeek('prev')} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">
                {weekDays[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h2>
              <button
                onClick={goToToday}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#d4a855]/10 text-[#d4a855] hover:bg-[#d4a855]/20 transition-colors"
              >
                Oggi
              </button>
            </div>
            <button onClick={() => navigateWeek('next')} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Days header */}
              <div className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.1)]">
                <div className="p-1.5 text-center text-[10px] text-[rgba(255,255,255,0.4)] font-medium border-r border-[rgba(255,255,255,0.05)]">
                  Ora
                </div>
                {weekDays.map((day, i) => {
                  const dayStr = formatDateStr(day)
                  const isToday = dayStr === todayStr
                  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
                  return (
                    <div
                      key={i}
                      className={`p-1.5 text-center border-r border-[rgba(255,255,255,0.05)] last:border-r-0 ${
                        isToday ? 'bg-[#d4a855]/10' : ''
                      }`}
                    >
                      <div className={`text-[10px] font-medium ${isToday ? 'text-[#d4a855]' : 'text-[rgba(255,255,255,0.4)]'}`}>
                        {dayNames[day.getDay()]}
                      </div>
                      <div className={`text-xs font-bold ${isToday ? 'text-[#d4a855]' : 'text-white'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time slots */}
              <div className="relative">
                {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-[rgba(255,255,255,0.05)]" style={{ height: '60px' }}>
                    <div className="p-1 text-right pr-2 text-[10px] text-[rgba(255,255,255,0.4)] border-r border-[rgba(255,255,255,0.05)]">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {weekDays.map((day, di) => {
                      const dayStr = formatDateStr(day)
                      const isToday = dayStr === todayStr
                      return (
                        <div
                          key={di}
                          className={`relative border-r border-[rgba(255,255,255,0.05)] last:border-r-0 ${
                            isToday ? 'bg-[#d4a855]/5' : ''
                          }`}
                        />
                      )
                    })}
                  </div>
                ))}

                {/* Appointments overlay */}
                <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                  <div />
                  {weekDays.map((day, di) => {
                    const dayApts = getAppointmentsForDay(day)
                    return (
                      <div key={di} className="relative">
                        {dayApts.map((apt) => {
                          const pos = getAppointmentPosition(apt)
                          return (
                            <div
                              key={apt.id}
                              className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-[10px] cursor-pointer pointer-events-auto border-l-2 overflow-hidden transition-transform hover:scale-105 hover:z-10 ${getStatusColor(apt.status)}`}
                              style={{
                                top: `${pos.top}px`,
                                height: `${Math.max(pos.height, 24)}px`,
                              }}
                              title={`${apt.time} - ${apt.clientName}\n${apt.service?.name || 'Servizio'}`}
                            >
                              <div className="font-medium text-white truncate">{apt.time}</div>
                              {pos.height >= 40 && <div className="text-white/80 truncate">{apt.clientName}</div>}
                              {pos.height >= 55 && <div className="text-white/60 truncate text-[9px]">{apt.service?.name}</div>}
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
          <div className="p-2 border-t border-[rgba(255,255,255,0.1)] flex gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-green-500/80 border-l-2 border-green-400" />
              <span className="text-[rgba(255,255,255,0.5)]">Confermato</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-[#d4a855]/80 border-l-2 border-[#d4a855]" />
              <span className="text-[rgba(255,255,255,0.5)]">Completato</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-red-500/50 border-l-2 border-red-400 opacity-60" />
              <span className="text-[rgba(255,255,255,0.5)]">Annullato/No Show</span>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-[rgba(255,255,255,0.1)] p-3 flex items-center justify-between gap-3 shadow-2xl">
          <span className="text-sm text-white">
            <span className="font-bold">{selectedIds.size}</span> selezionati
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={exitSelectionMode}
              className="admin-btn admin-btn-secondary text-sm"
            >
              Annulla
            </button>
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="admin-btn text-sm flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              <Trash2 className="w-4 h-4" />
              Elimina selezionati
            </button>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="admin-card p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Conferma eliminazione</h3>
            <p className="text-sm text-[rgba(255,255,255,0.7)]">
              Eliminare <span className="font-bold text-red-400">{selectedIds.size}</span> appuntamenti passati?
            </p>
            <p className="text-xs text-[rgba(255,255,255,0.5)]">
              Le statistiche dei clienti verranno aggiornate automaticamente. Questa azione è irreversibile.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkConfirm(false)}
                disabled={bulkDeleting}
                className="admin-btn admin-btn-secondary text-sm"
              >
                Annulla
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="admin-btn text-sm flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white border-red-500 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {bulkDeleting ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
