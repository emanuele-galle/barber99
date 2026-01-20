'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { DeleteButton } from './DeleteButton'

interface ReviewActionsProps {
  reviewId: string
  isFeatured: boolean
}

export function ReviewActions({ reviewId, isFeatured }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggleFeatured = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !isFeatured }),
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Errore')
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={toggleFeatured}
        disabled={loading}
        className={`admin-btn py-2 px-3 ${
          isFeatured ? 'admin-btn-secondary' : 'admin-btn-primary'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFeatured ? (
          <>
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nascondi</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">In Evidenza</span>
          </>
        )}
      </button>
      <DeleteButton
        collection="reviews"
        id={reviewId}
        name="questa recensione"
      />
    </div>
  )
}
