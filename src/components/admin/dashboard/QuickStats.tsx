'use client'

import React, { useEffect, useState } from 'react'

interface Stats {
  appointmentsToday: number
  appointmentsWeek: number
  pendingContacts: number
  recentReviews: number
  totalServices: number
  avgRating: number
}

interface StatCardProps {
  label: string
  value: number | string
  subValue?: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  delay: number
  href?: string
  pulse?: boolean
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  color,
  bgGradient,
  delay,
  href,
  pulse,
}) => {
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const handleClick = () => {
    if (href) {
      window.location.href = href
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#141414',
        borderRadius: '16px',
        padding: '24px',
        border: `1px solid ${hovered ? color : 'rgba(255, 255, 255, 0.06)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: href ? 'pointer' : 'default',
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? hovered
            ? 'translateY(-4px) scale(1.02)'
            : 'translateY(0) scale(1)'
          : 'translateY(20px) scale(0.95)',
        boxShadow: hovered
          ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${color}20`
          : '0 4px 16px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: bgGradient,
          opacity: hovered ? 0.08 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Top corner accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with icon and pulse indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              border: `1px solid ${color}30`,
              transition: 'all 0.3s ease',
              transform: hovered ? 'rotate(-5deg) scale(1.1)' : 'rotate(0) scale(1)',
            }}
          >
            {icon}
          </div>
          {pulse && (
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 0 3px ${color}30`,
                animation: 'pulse 2s infinite',
              }}
            />
          )}
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: '40px',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: 1,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
            transition: 'color 0.3s ease',
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontWeight: '500',
            marginBottom: subValue ? '8px' : 0,
          }}
        >
          {label}
        </div>

        {/* Sub value (e.g., trend) */}
        {subValue && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: `${color}15`,
              color: color,
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {subValue}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.8 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    appointmentsWeek: 0,
    pendingContacts: 0,
    recentReviews: 0,
    totalServices: 0,
    avgRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]

        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay() + 1)
        const weekStartStr = weekStart.toISOString().split('T')[0]

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        const weekEndStr = weekEnd.toISOString().split('T')[0]

        const [appointmentsRes, contactsRes, reviewsRes, servicesRes] = await Promise.all([
          fetch(`/api/appointments?limit=1000`),
          fetch(`/api/contact-submissions?where[status][equals]=new&limit=100`),
          fetch(`/api/reviews?sort=-createdAt&limit=100`),
          fetch(`/api/services?where[active][equals]=true&limit=100`),
        ])

        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : { docs: [] }
        const contacts = contactsRes.ok ? await contactsRes.json() : { docs: [] }
        const reviews = reviewsRes.ok ? await reviewsRes.json() : { docs: [] }
        const services = servicesRes.ok ? await servicesRes.json() : { docs: [] }

        const appointmentsToday = appointments.docs?.filter((apt: { date: string; status: string }) => {
          const aptDate = apt.date?.split('T')[0]
          return aptDate === todayStr && apt.status !== 'cancelled'
        }).length || 0

        const appointmentsWeek = appointments.docs?.filter((apt: { date: string; status: string }) => {
          const aptDate = apt.date?.split('T')[0]
          return aptDate >= weekStartStr && aptDate <= weekEndStr && apt.status !== 'cancelled'
        }).length || 0

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentReviews = reviews.docs?.filter((review: { createdAt: string }) => {
          return new Date(review.createdAt) > sevenDaysAgo
        }).length || 0

        const ratings = reviews.docs?.map((r: { rating: number }) => r.rating) || []
        const avgRating = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : 0

        setStats({
          appointmentsToday,
          appointmentsWeek,
          pendingContacts: contacts.totalDocs || contacts.docs?.length || 0,
          recentReviews,
          totalServices: services.totalDocs || services.docs?.length || 0,
          avgRating: Number(avgRating),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      label: 'Appuntamenti Oggi',
      value: loading ? '-' : stats.appointmentsToday,
      subValue: stats.appointmentsToday > 0 ? 'In programma' : undefined,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      ),
      color: '#d4a855',
      bgGradient: 'linear-gradient(135deg, #d4a855, #b48835)',
      href: '/admin/collections/appointments',
      pulse: stats.appointmentsToday > 0,
    },
    {
      label: 'Questa Settimana',
      value: loading ? '-' : stats.appointmentsWeek,
      subValue: stats.appointmentsWeek > 0 ? 'Totale settimana' : undefined,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      ),
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
      href: '/admin/collections/appointments',
    },
    {
      label: 'Messaggi Nuovi',
      value: loading ? '-' : stats.pendingContacts,
      subValue: stats.pendingContacts > 0 ? 'Da leggere' : 'Tutto letto',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      color: stats.pendingContacts > 0 ? '#f59e0b' : '#6b7280',
      bgGradient: stats.pendingContacts > 0
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'linear-gradient(135deg, #6b7280, #4b5563)',
      href: '/admin/collections/contact-submissions',
      pulse: stats.pendingContacts > 0,
    },
    {
      label: 'Recensioni',
      value: loading ? '-' : stats.avgRating || '-',
      subValue: stats.recentReviews > 0 ? `+${stats.recentReviews} questa settimana` : undefined,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      href: '/admin/collections/reviews',
    },
  ]

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
          Panoramica
        </h2>
        <span
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginLeft: 'auto',
          }}
        >
          Aggiornamento automatico
        </span>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            {...card}
            value={card.value}
            delay={index * 100}
          />
        ))}
      </div>
    </div>
  )
}

export default QuickStats
