'use client'

import React, { useEffect, useState } from 'react'

interface Activity {
  id: string
  type: 'appointment' | 'contact' | 'review'
  title: string
  subtitle: string
  time: string
  status?: string
  rating?: number
  href: string
}

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const [appointmentsRes, contactsRes, reviewsRes] = await Promise.all([
        fetch('/api/appointments?sort=-createdAt&limit=5'),
        fetch('/api/contact-submissions?sort=-createdAt&limit=5'),
        fetch('/api/reviews?sort=-createdAt&limit=5'),
      ])

      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : { docs: [] }
      const contacts = contactsRes.ok ? await contactsRes.json() : { docs: [] }
      const reviews = reviewsRes.ok ? await reviewsRes.json() : { docs: [] }

      const allActivities: Activity[] = []

      // Process appointments
      appointments.docs?.forEach((apt: {
        id: string
        clientName: string
        date: string
        time: string
        status: string
        createdAt: string
      }) => {
        allActivities.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          title: apt.clientName,
          subtitle: `${formatDisplayDate(apt.date)} alle ${apt.time}`,
          time: apt.createdAt,
          status: apt.status,
          href: `/admin/collections/appointments/${apt.id}`,
        })
      })

      // Process contacts
      contacts.docs?.forEach((contact: {
        id: string
        name: string
        subject: string
        status: string
        createdAt: string
      }) => {
        allActivities.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: contact.name,
          subtitle: getSubjectLabel(contact.subject),
          time: contact.createdAt,
          status: contact.status,
          href: `/admin/collections/contact-submissions/${contact.id}`,
        })
      })

      // Process reviews
      reviews.docs?.forEach((review: {
        id: string
        author: string
        rating: number
        createdAt: string
      }) => {
        allActivities.push({
          id: `review-${review.id}`,
          type: 'review',
          title: review.author,
          subtitle: `${review.rating} stelle`,
          time: review.createdAt,
          rating: review.rating,
          href: `/admin/collections/reviews/${review.id}`,
        })
      })

      // Sort by time and take latest 8
      allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setActivities(allActivities.slice(0, 8))
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }

  const getSubjectLabel = (subject: string) => {
    const labels: Record<string, string> = {
      info: 'Informazioni',
      booking: 'Prenotazione',
      collaboration: 'Collaborazione',
      complaint: 'Reclamo',
      other: 'Altro',
    }
    return labels[subject] || subject
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ora'
    if (diffMins < 60) return `${diffMins}m fa`
    if (diffHours < 24) return `${diffHours}h fa`
    if (diffDays < 7) return `${diffDays}g fa`
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'appointment':
        return {
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          ),
          color: '#d4a855',
          label: 'Appuntamento',
        }
      case 'contact':
        return {
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          ),
          color: '#06b6d4',
          label: 'Messaggio',
        }
      case 'review':
        return {
          icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ),
          color: '#f59e0b',
          label: 'Recensione',
        }
      default:
        return { icon: null, color: '#6b7280', label: '' }
    }
  }

  const getStatusBadge = (status: string | undefined, type: string) => {
    if (type === 'review') return null

    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: '#f59e0b', label: 'In attesa' },
      confirmed: { color: '#22c55e', label: 'Confermato' },
      completed: { color: '#6b7280', label: 'Completato' },
      cancelled: { color: '#ef4444', label: 'Cancellato' },
      new: { color: '#06b6d4', label: 'Nuovo' },
      read: { color: '#8b5cf6', label: 'Letto' },
      replied: { color: '#22c55e', label: 'Risposto' },
    }

    const config = statusConfig[status || ''] || { color: '#6b7280', label: status }

    return (
      <span
        style={{
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          background: `${config.color}20`,
          color: config.color,
          textTransform: 'capitalize',
        }}
      >
        {config.label}
      </span>
    )
  }

  const ActivityItem: React.FC<{ activity: Activity; index: number }> = ({ activity, index }) => {
    const [hovered, setHovered] = useState(false)
    const config = getTypeConfig(activity.type)

    return (
      <a
        href={activity.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          borderRadius: '12px',
          background: hovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
          transition: 'all 0.2s ease',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
          transitionDelay: `${index * 50}ms`,
          textDecoration: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${config.color}15`,
            color: config.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                fontWeight: '600',
                fontSize: '14px',
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activity.title}
            </span>
            {getStatusBadge(activity.status, activity.type)}
            {activity.type === 'review' && activity.rating && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: '#f59e0b',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                {activity.rating}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {activity.subtitle}
          </div>
        </div>

        {/* Time */}
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            flexShrink: 0,
          }}
        >
          {formatRelativeTime(activity.time)}
        </div>

        {/* Arrow */}
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.3)',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </a>
    )
  }

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
              background: 'linear-gradient(180deg, #d4a855, #b48835)',
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
            Attività Recenti
          </h3>
        </div>
        <a
          href="/admin"
          style={{
            fontSize: '13px',
            color: '#d4a855',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Vedi tutto
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>

      {/* Activity list */}
      <div style={{ padding: '8px' }}>
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
        ) : activities.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Nessuna attività recente
          </div>
        ) : (
          activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))
        )}
      </div>
    </div>
  )
}

export default RecentActivity
