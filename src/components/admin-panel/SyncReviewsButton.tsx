'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/Toast'

export function SyncReviewsButton() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSync = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante sincronizzazione')
      }

      showToast(
        'success',
        `${data.synced} nuove recensioni sincronizzate (${data.skipped} già presenti)`,
        'Sincronizzazione completata'
      )
      router.refresh()
    } catch (error) {
      console.error('Sync error:', error)
      showToast(
        'error',
        error instanceof Error ? error.message : 'Errore durante sincronizzazione',
        'Errore'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="admin-btn admin-btn-primary"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sincronizzazione in corso...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Sincronizza con Google
        </>
      )}
    </button>
  )
}
