'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, X } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface DeleteClientButtonProps {
  clientId: string
  clientName: string
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore durante eliminazione')

      showToast('success', `Cliente "${clientName}" eliminato`, 'Eliminato')
      router.push('/admin-panel/clienti')
    } catch (error) {
      console.error('Delete error:', error)
      showToast('error', 'Errore durante eliminazione del cliente', 'Errore')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="admin-btn admin-btn-danger py-2 px-3"
        title="Elimina cliente"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="admin-modal p-6 relative admin-fade-in">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-[rgba(255,255,255,0.5)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-white mb-2">Elimina cliente</h3>
            <p className="text-[rgba(255,255,255,0.6)] mb-6">
              Sei sicuro di voler eliminare <span className="text-white font-medium">{clientName}</span>?
              <br />
              <span className="text-red-400 text-sm">Questa azione non può essere annullata.</span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="admin-btn admin-btn-secondary"
                disabled={loading}
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                className="admin-btn admin-btn-danger"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
