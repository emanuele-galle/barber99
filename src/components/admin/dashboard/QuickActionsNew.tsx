'use client'

import { UserPlus, Clock, Calendar, ClipboardList } from 'lucide-react'
import Link from 'next/link'

interface QuickActionsProps {
  pendingCount?: number
  queueCount?: number
}

export function QuickActions({ queueCount = 0 }: QuickActionsProps) {
  return (
    <div className="admin-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Azioni Rapide</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Senza appuntamento - Azione principale */}
        <Link
          href="/admin-panel/coda"
          className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-[#d4a855] hover:bg-[#e8c882] text-black transition-all group"
        >
          <UserPlus className="w-6 h-6" />
          <span className="text-sm font-semibold">+ Cliente</span>
          {queueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {queueCount}
            </span>
          )}
        </Link>

        {/* Coda */}
        <Link
          href="/admin-panel/coda"
          className="relative flex flex-col items-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#d4a855] hover:bg-[rgba(212,168,85,0.05)] text-white transition-all"
        >
          <Clock className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-medium">Coda</span>
          {queueCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
              {queueCount}
            </span>
          )}
        </Link>

        {/* Nuovo Appuntamento */}
        <Link
          href="/admin-panel/appuntamenti/nuovo"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#d4a855] hover:bg-[rgba(212,168,85,0.05)] text-white transition-all"
        >
          <Calendar className="w-6 h-6 text-green-400" />
          <span className="text-sm font-medium">Prenota</span>
        </Link>

        {/* Tutti Appuntamenti */}
        <Link
          href="/admin-panel/appuntamenti"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:border-[#d4a855] hover:bg-[rgba(212,168,85,0.05)] text-white transition-all"
        >
          <ClipboardList className="w-6 h-6 text-purple-400" />
          <span className="text-sm font-medium">Appuntamenti</span>
        </Link>
      </div>
    </div>
  )
}
