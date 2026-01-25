'use client'

import { LucideIcon, Calendar, Users, Scissors, Star, Image, Clock, FileText, Mail, BarChart2, Settings } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  preset?: 'appointments' | 'clients' | 'services' | 'reviews' | 'gallery' | 'queue' | 'contacts' | 'analytics'
}

const presets: Record<string, { icon: LucideIcon; title: string; description: string }> = {
  appointments: {
    icon: Calendar,
    title: 'Nessun appuntamento',
    description: 'Non ci sono appuntamenti per questo periodo.',
  },
  clients: {
    icon: Users,
    title: 'Nessun cliente',
    description: 'I clienti verranno aggiunti automaticamente quando prenotano.',
  },
  services: {
    icon: Scissors,
    title: 'Nessun servizio',
    description: 'Aggiungi i servizi offerti dal tuo salone.',
  },
  reviews: {
    icon: Star,
    title: 'Nessuna recensione',
    description: 'Le recensioni dei clienti appariranno qui.',
  },
  gallery: {
    icon: Image,
    title: 'Galleria vuota',
    description: 'Aggiungi foto dei tuoi lavori migliori.',
  },
  queue: {
    icon: Clock,
    title: 'Nessuno in coda',
    description: 'I clienti senza appuntamento appariranno qui quando si registrano.',
  },
  contacts: {
    icon: Mail,
    title: 'Nessun messaggio',
    description: 'I messaggi dal form contatti appariranno qui.',
  },
  analytics: {
    icon: BarChart2,
    title: 'Dati insufficienti',
    description: 'Servono più appuntamenti per mostrare statistiche.',
  },
}

export function EmptyState({
  icon: CustomIcon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  preset,
}: EmptyStateProps) {
  const config = preset ? presets[preset] : null
  const Icon = CustomIcon || config?.icon || FileText
  const displayTitle = title || config?.title || 'Nessun elemento'
  const displayDescription = description || config?.description

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#d4a855]/50" />
      </div>

      <h3 className="text-lg font-medium text-white mb-2">
        {displayTitle}
      </h3>

      {displayDescription && (
        <p className="text-[rgba(255,255,255,0.5)] text-sm max-w-md mb-6">
          {displayDescription}
        </p>
      )}

      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link href={actionHref} className="admin-btn admin-btn-primary">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="admin-btn admin-btn-primary">
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}

// Versione inline per card piccole
export function EmptyStateInline({
  message,
  icon: Icon = FileText,
}: {
  message: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex items-center gap-3 p-4 text-[rgba(255,255,255,0.4)]">
      <Icon className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  )
}
