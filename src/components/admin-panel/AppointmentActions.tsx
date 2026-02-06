'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, CheckCircle, XCircle, Loader2, Bell, UserX, Mail } from 'lucide-react'
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

  // No actions for terminal states
  if (currentStatus === 'completed' || currentStatus === 'cancelled' || currentStatus === 'noshow') {
    return null
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

            {/* WhatsApp */}
            {clientPhone && (
              <a
                href={`https://wa.me/${clientPhone.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Ciao${clientName ? ` ${clientName.split(' ')[0]}` : ''}! Ti scriviamo da Barber 99 riguardo il tuo appuntamento.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
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
