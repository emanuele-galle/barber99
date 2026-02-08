'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface ToggleVisibilityButtonProps {
  id: string
  currentVisibility: boolean
}

export function ToggleVisibilityButton({ id, currentVisibility }: ToggleVisibilityButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/instagram-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isVisible: !currentVisibility }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Toggle visibility error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
        currentVisibility
          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
      } disabled:opacity-50`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : currentVisibility ? (
        <EyeOff className="w-3 h-3" />
      ) : (
        <Eye className="w-3 h-3" />
      )}
      {currentVisibility ? 'Nascondi' : 'Mostra'}
    </button>
  )
}
