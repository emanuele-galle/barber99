'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, Trash2, Loader2 } from 'lucide-react'
import { DeleteButton } from './DeleteButton'

interface ContactActionsProps {
  contactId: string
  currentStatus: string
  email: string
}

export function ContactActions({ contactId, currentStatus, email }: ContactActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const markAsRead = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/contact-submissions/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
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
      {currentStatus === 'new' && (
        <button
          onClick={markAsRead}
          disabled={loading}
          className="admin-btn admin-btn-secondary py-2 px-3"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Segna letto</span>
            </>
          )}
        </button>
      )}
      <a
        href={`mailto:${email}`}
        className="admin-btn admin-btn-secondary py-2 px-3"
      >
        <Mail className="w-4 h-4" />
        <span className="hidden sm:inline">Rispondi</span>
      </a>
      <DeleteButton
        collection="contact-submissions"
        id={contactId}
        name="questo messaggio"
      />
    </div>
  )
}
