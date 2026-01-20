'use client'

import React, { useEffect, useState } from 'react'

interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  time: string
  service: { name: string } | string
  barber: { name: string } | string
  status: string
  duration?: number
}

const TodaySchedule: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    fetchTodayAppointments()

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const response = await fetch(
        `/api/appointments?where[date][equals]=${todayStr}&sort=time&depth=1&limit=20`
      )

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.docs || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: '#f59e0b', bg: '#f59e0b20', label: 'In attesa' },
      confirmed: { color: '#22c55e', bg: '#22c55e20', label: 'Confermato' },
      completed: { color: '#6b7280', bg: '#6b728020', label: 'Completato' },
      cancelled: { color: '#ef4444', bg: '#ef444420', label: 'Cancellato' },
      noshow: { color: '#ef4444', bg: '#ef444420', label: 'No Show' },
    }
    return configs[status] || configs.pending
  }

  const isCurrentOrUpcoming = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const appointmentTime = new Date()
    appointmentTime.setHours(hours, minutes, 0, 0)

    const now = new Date()
    const diffMins = (appointmentTime.getTime() - now.getTime()) / 60000

    if (diffMins >= -30 && diffMins <= 30) return 'current'
    if (diffMins > 30) return 'upcoming'
    return 'past'
  }

  const formatTimeRange = (time: string, duration: number = 30) => {
    const [hours, minutes] = time.split(':').map(Number)
    const endTime = new Date()
    endTime.setHours(hours, minutes + duration, 0, 0)

    return `${time} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
  }

  const AppointmentCard: React.FC<{ apt: Appointment; index: number }> = ({ apt, index }) => {
    const [hovered, setHovered] = useState(false)
    const statusConfig = getStatusConfig(apt.status)
    const timeStatus = isCurrentOrUpcoming(apt.time)

    const serviceName = typeof apt.service === 'object' ? apt.service?.name : 'Servizio'
    const barberName = typeof apt.barber === 'object' ? apt.barber?.name : 'Barbiere'

    return (
      <a
        href={`/admin/collections/appointments/${apt.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'block',
          padding: '16px 20px',
          background: timeStatus === 'current' ? 'rgba(212, 168, 85, 0.08)' : 'transparent',
          borderRadius: '12px',
          marginBottom: '8px',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
          transitionDelay: `${index * 50}ms`,
          border: timeStatus === 'current'
            ? '1px solid rgba(212, 168, 85, 0.3)'
            : hovered
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid transparent',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Current indicator */}
        {timeStatus === 'current' && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, #d4a855, #b48835)',
              borderRadius: '0 2px 2px 0',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {/* Time block */}
          <div
            style={{
              minWidth: '70px',
              textAlign: 'center',
              padding: '8px 0',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: timeStatus === 'current' ? '#d4a855' : timeStatus === 'past' ? '#6b7280' : '#ffffff',
                marginBottom: '2px',
              }}
            >
              {apt.time}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {apt.duration || 30} min
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '1px',
              alignSelf: 'stretch',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '4px 0',
            }}
          />

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontWeight: '600',
                  fontSize: '15px',
                  color: timeStatus === 'past' ? '#6b7280' : '#ffffff',
                }}
              >
                {apt.clientName}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: statusConfig.bg,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="6" r="3" />
                  <path d="M8.12 8.12L12 12" />
                  <path d="M20 4L8.12 15.88" />
                </svg>
                {serviceName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {barberName}
              </span>
            </div>
          </div>

          {/* Phone quick action */}
          {apt.clientPhone && (
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              <a
                href={`tel:${apt.clientPhone}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  textDecoration: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </a>
    )
  }

  const activeAppointments = appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'noshow')

  return (
    <div
      style={{
        background: '#141414',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '4px',
              height: '20px',
              borderRadius: '2px',
              background: 'linear-gradient(180deg, #22c55e, #16a34a)',
            }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
            }}
          >
            Programma di Oggi
          </h3>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
            }}
          >
            {activeAppointments.length} appuntamenti
          </span>
        </div>
        <a
          href="/admin/collections/appointments/create"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(212, 168, 85, 0.15)',
            color: '#d4a855',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Aggiungi
        </a>
      </div>

      {/* Appointments list */}
      <div style={{ padding: '12px 16px', maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Caricamento...
          </div>
        ) : activeAppointments.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '4px',
              }}
            >
              Nessun appuntamento oggi
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              Aggiungi il primo appuntamento della giornata
            </div>
          </div>
        ) : (
          activeAppointments.map((apt, index) => (
            <AppointmentCard key={apt.id} apt={apt} index={index} />
          ))
        )}
      </div>
    </div>
  )
}

export default TodaySchedule
