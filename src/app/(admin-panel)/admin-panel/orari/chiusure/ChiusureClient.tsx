'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, Trash2, Loader2, CalendarX, CalendarRange, List, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

// Timezone-safe date formatting (local date, not UTC)
function localDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const closureTypes = [
  { value: 'holiday', label: 'Festivo' },
  { value: 'vacation', label: 'Ferie' },
  { value: 'special', label: 'Chiusura Speciale' },
]

interface ClosedDay {
  id: string
  date: string
  type: string
  reason?: string
  recurring: boolean
}

export default function ChiusurePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Form state
  const [isRange, setIsRange] = useState(false)
  const [date, setDate] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [type, setType] = useState('holiday')
  const [reason, setReason] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [error, setError] = useState('')

  // Fetch closed days
  useEffect(() => {
    fetchClosedDays()
  }, [])

  const fetchClosedDays = async () => {
    try {
      const res = await fetch('/api/closed-days?sort=date&limit=100', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setClosedDays(data.docs || [])
      }
    } catch (err) {
      console.error('Error fetching closed days:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate all dates in a range
  const generateDateRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      dates.push(localDateStr(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date) {
      setError('Seleziona una data')
      return
    }

    if (isRange && !dateEnd) {
      setError('Seleziona la data di fine')
      return
    }

    if (isRange && new Date(dateEnd) < new Date(date)) {
      setError('La data di fine deve essere dopo la data di inizio')
      return
    }

    setSaving(true)
    setError('')

    try {
      // If range mode, create multiple closed days
      const datesToCreate = isRange ? generateDateRange(date, dateEnd) : [date]
      const errors: string[] = []

      for (const dateToCreate of datesToCreate) {
        const res = await fetch('/api/closed-days', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateToCreate,
            type,
            reason: reason || undefined,
            recurring: isRange ? false : recurring,
          }),
          credentials: 'include',
        })

        if (!res.ok) {
          const data = await res.json()
          const msg = data.errors?.[0]?.message || `Errore per ${dateToCreate}`
          // For ranges, collect errors but continue creating the rest
          if (isRange) {
            errors.push(msg)
          } else {
            throw new Error(msg)
          }
        }
      }

      if (errors.length > 0 && errors.length === datesToCreate.length) {
        throw new Error('Nessuna data creata. Alcune date potrebbero essere gia\' presenti.')
      }

      // Reset form
      setDate('')
      setDateEnd('')
      setIsRange(false)
      setType('holiday')
      setReason('')
      setRecurring(false)

      // Show partial success warning for ranges
      if (errors.length > 0) {
        setError(`${datesToCreate.length - errors.length} date create, ${errors.length} saltate (gia\' presenti)`)
      }

      // Refresh list
      fetchClosedDays()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo giorno di chiusura?')) {
      return
    }

    try {
      const res = await fetch(`/api/closed-days/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        setError('Errore durante eliminazione')
        return
      }

      setError('')
      fetchClosedDays()
      router.refresh()
    } catch (err) {
      console.error('Error deleting:', err)
      setError('Errore durante eliminazione')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getTypeLabel = (typeValue: string) => {
    return closureTypes.find((t) => t.value === typeValue)?.label || typeValue
  }

  const getTypeBadgeClass = (typeValue: string) => {
    switch (typeValue) {
      case 'holiday':
        return 'admin-badge-gold'
      case 'vacation':
        return 'admin-badge-success'
      case 'special':
        return 'admin-badge-warning'
      default:
        return 'admin-badge-gold'
    }
  }

  // Separate past and future days (timezone-safe string comparison)
  const todayStr = localDateStr(new Date())

  const futureDays = closedDays.filter((d) => d.date.split('T')[0] >= todayStr)
  const pastDays = closedDays.filter((d) => d.date.split('T')[0] < todayStr)

  // Calendar helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const calendarDays = useMemo(() => getMonthDays(currentMonth), [currentMonth])

  const getClosuresForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = localDateStr(date)
    return closedDays.filter((d) => {
      const closedDateStr = d.date.split('T')[0]
      return closedDateStr === dateStr
    })
  }

  const isDateClosed = (date: Date | null) => {
    return getClosuresForDate(date).length > 0
  }

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-panel/orari"
            className="p-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Giorni di Chiusura</h1>
            <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
              Gestisci ferie, festivi e chiusure speciali
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#d4a855] text-black'
                : 'text-white hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#d4a855] text-black'
                : 'text-white hover:bg-[rgba(255,255,255,0.1)]'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendario
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add form */}
        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#d4a855]" />
            Aggiungi Chiusura
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Range Toggle */}
            <div className="flex items-center gap-3 p-3 bg-[#111111] rounded-lg border border-[rgba(255,255,255,0.05)]">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={isRange}
                  onChange={(e) => {
                    setIsRange(e.target.checked)
                    if (!e.target.checked) setDateEnd('')
                  }}
                  className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
                />
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-[#d4a855]" />
                  <span className="text-white text-sm font-medium">
                    Periodo di chiusura (ferie)
                  </span>
                </div>
              </label>
            </div>

            {/* Date / Date Range */}
            <div className={isRange ? 'grid grid-cols-2 gap-3' : ''}>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
                  {isRange ? 'Data Inizio *' : 'Data *'}
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={localDateStr(new Date())}
                  className="admin-input w-full"
                  required
                />
              </div>

              {isRange && (
                <div>
                  <label htmlFor="dateEnd" className="block text-sm font-medium text-white mb-2">
                    Data Fine *
                  </label>
                  <input
                    id="dateEnd"
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    min={date || localDateStr(new Date())}
                    className="admin-input w-full"
                    required={isRange}
                  />
                </div>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                Tipo
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="admin-input w-full"
              >
                {closureTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-white mb-2">
                Motivo
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Es. Natale, Ferie estive..."
                className="admin-input w-full"
              />
            </div>

            {/* Recurring - only if not range */}
            {!isRange && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
                  />
                  <span className="text-white text-sm">
                    Ricorrente ogni anno
                  </span>
                </label>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRange ? 'Creazione periodo...' : 'Salvataggio...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {isRange ? 'Aggiungi Periodo' : 'Aggiungi Chiusura'}
                </>
              )}
            </button>
          </form>

        </div>

        {/* List or Calendar View */}
        <div className="admin-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#d4a855]" />
            Chiusure Programmate
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#d4a855]" />
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <>
              {futureDays.length > 0 ? (
                <div className="space-y-3">
                  {futureDays.map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-[rgba(255,255,255,0.05)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
                          <CalendarX className="w-5 h-5 text-[#d4a855]" />
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">
                            {formatDate(day.date)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`admin-badge ${getTypeBadgeClass(day.type)} text-xs`}>
                              {getTypeLabel(day.type)}
                            </span>
                            {day.reason && (
                              <span className="text-xs text-[rgba(255,255,255,0.5)]">
                                {day.reason}
                              </span>
                            )}
                            {day.recurring && (
                              <span className="text-xs text-blue-400">
                                Ricorrente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(day.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[#d4a855]" />
                  </div>
                  <p className="text-[rgba(255,255,255,0.5)] text-sm">
                    Nessuna chiusura programmata
                  </p>
                </div>
              )}

              {/* Past days (collapsed) */}
              {pastDays.length > 0 && (
                <details className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <summary className="text-sm text-[rgba(255,255,255,0.5)] cursor-pointer hover:text-white transition-colors">
                    {pastDays.length} chiusure passate
                  </summary>
                  <div className="mt-3 space-y-2">
                    {pastDays.slice(0, 5).map((day) => (
                      <div
                        key={day.id}
                        className="flex items-center justify-between p-2 opacity-50"
                      >
                        <span className="text-sm text-white capitalize">
                          {formatDate(day.date)}
                        </span>
                        <span className="text-xs text-[rgba(255,255,255,0.5)]">
                          {getTypeLabel(day.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          ) : (
            /* Calendar View */
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {currentMonth.toLocaleDateString('it-IT', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={goToToday}
                    className="text-xs text-[#d4a855] hover:text-[#e5b966] transition-colors"
                  >
                    Oggi
                  </button>
                </div>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-[rgba(255,255,255,0.5)] py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const isClosed = isDateClosed(day)
                  const closures = getClosuresForDate(day)
                  const isToday =
                    day && day.toDateString() === new Date().toDateString()
                  const isPast = day && localDateStr(day) < todayStr

                  return (
                    <div
                      key={index}
                      className={`relative aspect-square p-1 rounded-lg transition-colors ${
                        !day
                          ? ''
                          : isClosed
                          ? 'bg-red-500/20 border border-red-500/30'
                          : isPast
                          ? 'bg-[rgba(255,255,255,0.02)]'
                          : 'bg-[#111111] hover:bg-[rgba(255,255,255,0.05)]'
                      } ${isToday ? 'ring-2 ring-[#d4a855]' : ''}`}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-sm font-medium ${
                              isClosed
                                ? 'text-red-400'
                                : isPast
                                ? 'text-[rgba(255,255,255,0.3)]'
                                : 'text-white'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {closures.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1">
                              {closures.slice(0, 1).map((closure) => (
                                <div
                                  key={closure.id}
                                  className="group relative"
                                  title={`${getTypeLabel(closure.type)}${closure.reason ? ': ' + closure.reason : ''}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <CalendarX className="w-3 h-3 text-red-400" />
                                    <span className="text-[10px] text-red-400 truncate">
                                      {closure.reason || getTypeLabel(closure.type)}
                                    </span>
                                  </div>
                                  {/* Delete button on hover */}
                                  <button
                                    onClick={() => handleDelete(closure.id)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full hidden group-hover:flex items-center justify-center"
                                  >
                                    <Trash2 className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              ))}
                              {closures.length > 1 && (
                                <span className="text-[9px] text-[rgba(255,255,255,0.5)]">
                                  +{closures.length - 1}
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                  <span className="text-[rgba(255,255,255,0.5)]">Chiuso</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded ring-2 ring-[#d4a855]" />
                  <span className="text-[rgba(255,255,255,0.5)]">Oggi</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
