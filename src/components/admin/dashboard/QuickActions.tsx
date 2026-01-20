'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ActionItem {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
  primary?: boolean
}

const QuickActions: React.FC = () => {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const primaryActions: ActionItem[] = [
    {
      label: 'Nuovo Appuntamento',
      description: 'Prenota un cliente',
      href: '/admin/collections/appointments/create',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      ),
      color: '#d4a855',
      primary: true,
    },
    {
      label: 'Vedi Calendario',
      description: 'Tutti gli appuntamenti',
      href: '/admin/collections/appointments',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="8" y2="14.01" />
          <line x1="12" y1="14" x2="12" y2="14.01" />
          <line x1="16" y1="14" x2="16" y2="14.01" />
          <line x1="8" y1="18" x2="8" y2="18.01" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
      ),
      color: '#22c55e',
    },
  ]

  const secondaryActions: ActionItem[] = [
    {
      label: 'Aggiungi Servizio',
      description: 'Nuovo servizio al menu',
      href: '/admin/collections/services/create',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      ),
      color: '#8b5cf6',
    },
    {
      label: 'Carica Foto',
      description: 'Aggiungi alla galleria',
      href: '/admin/collections/gallery/create',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      color: '#ec4899',
    },
    {
      label: 'Nuova Recensione',
      description: 'Aggiungi feedback',
      href: '/admin/collections/reviews/create',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: '#f59e0b',
    },
    {
      label: 'Messaggi',
      description: 'Vedi richieste',
      href: '/admin/collections/contact-submissions',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      color: '#06b6d4',
    },
  ]

  const ActionCard: React.FC<{ action: ActionItem; index: number; large?: boolean }> = ({
    action,
    index,
    large,
  }) => {
    const [hovered, setHovered] = useState(false)

    return (
      <button
        onClick={() => router.push(action.href)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          flexDirection: large ? 'row' : 'column',
          alignItems: large ? 'center' : 'flex-start',
          gap: large ? '20px' : '12px',
          padding: large ? '24px 28px' : '20px',
          borderRadius: '16px',
          border: action.primary
            ? 'none'
            : `1px solid ${hovered ? action.color + '50' : 'rgba(255, 255, 255, 0.06)'}`,
          background: action.primary
            ? `linear-gradient(135deg, ${action.color} 0%, ${action.color}cc 100%)`
            : '#141414',
          color: action.primary ? '#0c0c0c' : '#ffffff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? hovered
              ? 'translateY(-4px)'
              : 'translateY(0)'
            : 'translateY(20px)',
          transitionDelay: `${index * 50}ms`,
          boxShadow: action.primary
            ? hovered
              ? `0 16px 40px ${action.color}40`
              : `0 8px 24px ${action.color}30`
            : hovered
            ? '0 12px 32px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'left',
          width: '100%',
        }}
      >
        {/* Hover gradient overlay for non-primary */}
        {!action.primary && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${action.color}10, transparent)`,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Icon container */}
        <div
          style={{
            width: large ? '56px' : '44px',
            height: large ? '56px' : '44px',
            borderRadius: '14px',
            background: action.primary
              ? 'rgba(0, 0, 0, 0.15)'
              : `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: action.primary ? '#0c0c0c' : action.color,
            transition: 'all 0.3s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            flexShrink: 0,
          }}
        >
          {action.icon}
        </div>

        {/* Text content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontWeight: '600',
              fontSize: large ? '16px' : '14px',
              marginBottom: '4px',
              color: action.primary ? '#0c0c0c' : '#ffffff',
            }}
          >
            {action.label}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: action.primary ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {action.description}
          </div>
        </div>

        {/* Arrow indicator for large cards */}
        {large && (
          <div
            style={{
              marginLeft: 'auto',
              opacity: hovered ? 1 : 0.5,
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'all 0.3s ease',
              color: action.primary ? '#0c0c0c' : action.color,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        )}
      </button>
    )
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '4px',
            height: '24px',
            borderRadius: '2px',
            background: 'linear-gradient(180deg, #d4a855, #b48835)',
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}
        >
          Azioni Rapide
        </h2>
      </div>

      {/* Primary actions - Large cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {primaryActions.map((action, index) => (
          <ActionCard key={action.label} action={action} index={index} large />
        ))}
      </div>

      {/* Secondary actions - Smaller cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {secondaryActions.map((action, index) => (
          <ActionCard key={action.label} action={action} index={index + 2} />
        ))}
      </div>
    </div>
  )
}

export default QuickActions
