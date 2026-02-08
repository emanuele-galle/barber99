'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface OpeningHoursData {
  id: string
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart?: string
  breakEnd?: string
}

interface OpeningHoursFormProps {
  dayOfWeek: number
  existingData: OpeningHoursData | null
}

export function OpeningHoursForm({ dayOfWeek, existingData }: OpeningHoursFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(existingData?.isOpen ?? true)
  const [openTime, setOpenTime] = useState(existingData?.openTime || '09:00')
  const [closeTime, setCloseTime] = useState(existingData?.closeTime || '19:00')
  const [breakStart, setBreakStart] = useState(existingData?.breakStart || '')
  const [breakEnd, setBreakEnd] = useState(existingData?.breakEnd || '')

  const handleSave = async () => {
    // Validate break times if provided
    if (isOpen && breakStart && breakEnd) {
      if (breakStart >= breakEnd) {
        showToast('error', 'L\'inizio pausa deve essere prima della fine pausa', 'Errore')
        return
      }
      if (breakStart < openTime || breakEnd > closeTime) {
        showToast('error', 'La pausa deve essere dentro l\'orario di apertura', 'Errore')
        return
      }
    }
    if (isOpen && ((breakStart && !breakEnd) || (!breakStart && breakEnd))) {
      showToast('error', 'Inserisci sia inizio che fine pausa, o nessuno dei due', 'Errore')
      return
    }

    setLoading(true)
    try {
      const url = existingData
        ? `/api/opening-hours/${existingData.id}`
        : '/api/opening-hours'
      const method = existingData ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek,
          isClosed: !isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
          breakStart: isOpen && breakStart ? breakStart : null,
          breakEnd: isOpen && breakEnd ? breakEnd : null,
        }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore durante il salvataggio')
      showToast('success', 'Orario salvato correttamente', 'Salvato')
      router.refresh()
    } catch (error) {
      console.error(error)
      showToast('error', 'Errore durante il salvataggio', 'Errore')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-wrap items-center gap-4">
      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
          className="w-5 h-5 rounded border-[rgba(212,168,85,0.3)] bg-[#0a0a0a] text-[#d4a855] focus:ring-[#d4a855] focus:ring-offset-0"
        />
        <span className={`text-sm ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
          {isOpen ? 'Aperto' : 'Chiuso'}
        </span>
      </label>

      {isOpen && (
        <>
          {/* Open time */}
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="admin-input w-28 text-sm"
            />
            <span className="text-[rgba(255,255,255,0.5)]">-</span>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="admin-input w-28 text-sm"
            />
          </div>

          {/* Break */}
          <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)]">
            <span>Pausa:</span>
            <input
              type="time"
              value={breakStart}
              onChange={(e) => setBreakStart(e.target.value)}
              className="admin-input w-24 text-sm"
              placeholder="--:--"
            />
            <span>-</span>
            <input
              type="time"
              value={breakEnd}
              onChange={(e) => setBreakEnd(e.target.value)}
              className="admin-input w-24 text-sm"
              placeholder="--:--"
            />
          </div>
        </>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="admin-btn admin-btn-primary py-2 px-3 ml-auto"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
