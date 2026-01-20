'use client'

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  rows?: number
  variant?: 'spinner' | 'skeleton' | 'card'
}

export function LoadingState({
  message = 'Caricamento...',
  rows = 3,
  variant = 'spinner'
}: LoadingStateProps) {

  if (variant === 'skeleton') {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="admin-card p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-[rgba(255,255,255,0.05)]" />
                <div className="h-3 w-2/3 rounded bg-[rgba(255,255,255,0.03)]" />
              </div>
              <div className="w-20 h-8 rounded bg-[rgba(255,255,255,0.05)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="admin-card p-6">
            <div className="h-6 w-1/2 rounded bg-[rgba(255,255,255,0.05)] mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-[rgba(255,255,255,0.03)]" />
              <div className="h-4 w-3/4 rounded bg-[rgba(255,255,255,0.03)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default: spinner
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-10 h-10 text-[#d4a855] animate-spin mb-4" />
      <p className="text-[rgba(255,255,255,0.5)] text-sm">{message}</p>
    </div>
  )
}

// Skeleton specifici per tabelle
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.05)]" />
        <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.05)]" />
        <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.05)]" />
        <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.05)]" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-[rgba(255,255,255,0.03)]">
          <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.03)]" />
          <div className="h-4 w-1/4 rounded bg-[rgba(255,255,255,0.03)]" />
        </div>
      ))}
    </div>
  )
}

// Skeleton per timeline giornata (usato nella dashboard)
export function TimelineSkeleton({ slots = 8 }: { slots?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: slots }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-12 h-4 rounded bg-[rgba(255,255,255,0.05)]" />
          <div className="flex-1 h-10 rounded bg-[rgba(255,255,255,0.03)]" />
        </div>
      ))}
    </div>
  )
}
