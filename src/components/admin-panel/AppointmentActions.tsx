'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, CheckCircle, XCircle, Loader2, Bell, UserX, Mail, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/Toast'

interface AppointmentActionsProps {
  appointmentId: string
  currentStatus: string
  clientEmail?: string
  clientName?: string
  clientPhone?: string
}

export function AppointmentActions({ appointmentId, currentStatus, clientEmail, clientName, clientPhone }: AppointmentActionsProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore durante aggiornamento')

      const statusMessages: Record<string, string> = {
        completed: 'Appuntamento completato',
        cancelled: 'Appuntamento annullato',
        noshow: 'Segnato come No-Show',
      }
      showToast('success', statusMessages[status] || 'Stato aggiornato', 'Aggiornato')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      showToast('error', 'Errore durante aggiornamento stato', 'Errore')
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const sendNotification = async () => {
    setSendingNotification(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reminder' }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore durante invio notifica')

      showToast('success', 'Promemoria inviato al cliente', 'Notifica inviata')
    } catch (error) {
      console.error('Notification error:', error)
      showToast('error', 'Impossibile inviare la notifica', 'Errore')
    } finally {
      setSendingNotification(false)
      setShowMenu(false)
    }
  }

  if (loading || sendingNotification) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#d4a855]" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-56 bg-[#1a1a1a] border border-[rgba(212,168,85,0.15)] rounded-lg shadow-xl overflow-hidden admin-fade-in">
            {/* Edit */}
            <Link
              href={`/admin-panel/appuntamenti/${appointmentId}/modifica`}
              onClick={() => setShowMenu(false)}
              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
            >
              <Pencil className="w-4 h-4 text-[#d4a855]" />
              Modifica
            </Link>

            {/* Status actions only for non-terminal states */}
            {currentStatus !== 'completed' && currentStatus !== 'cancelled' && currentStatus !== 'noshow' && (
              <>
                {/* Complete */}
                {currentStatus === 'confirmed' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#d4a855]" />
                    Completa
                  </button>
                )}

                {/* No-Show */}
                <button
                  onClick={() => updateStatus('noshow')}
                  className="w-full px-4 py-3 text-left text-sm text-orange-400 hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  No Show
                </button>

                {/* Cancel */}
                <button
                  onClick={() => updateStatus('cancelled')}
                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annulla
                </button>

                {/* Divider */}
                <div className="border-t border-[rgba(255,255,255,0.05)] my-1" />

                {/* Notification */}
                <button
                  onClick={sendNotification}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                >
                  <Bell className="w-4 h-4 text-blue-400" />
                  Invia Notifica
                </button>
              </>
            )}

            {/* Email */}
            {clientEmail && (
              <a
                href={`mailto:${clientEmail}?subject=Barber 99 - ${clientName ? `Appuntamento di ${clientName}` : 'Il tuo appuntamento'}`}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                onClick={() => setShowMenu(false)}
              >
                <Mail className="w-4 h-4 text-purple-400" />
                Scrivi Email
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}
