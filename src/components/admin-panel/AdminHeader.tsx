'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Bell, ExternalLink, Scissors, Clock, MessageSquare,
  LayoutDashboard, Calendar, UserPlus, User, BarChart2, Star, Settings, LogOut, Plus,
} from 'lucide-react'

interface Notification {
  id: string
  type: 'imminent' | 'contact' | 'new_booking'
  title: string
  message: string
  time: string
  link: string
}

interface AdminHeaderProps {
  user: { email?: string; name?: string } | null
}

const menuItems = [
  { href: '/admin-panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin-panel/appuntamenti', label: 'Appuntamenti', icon: Calendar },
  { href: '/admin-panel/coda', label: 'Senza appuntamento', icon: UserPlus },
  { href: '/admin-panel/clienti', label: 'Clienti', icon: User },
  { href: '/admin-panel/servizi', label: 'Servizi', icon: Scissors },
  { href: '/admin-panel/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin-panel/orari', label: 'Orari', icon: Clock },
  { href: '/admin-panel/recensioni', label: 'Recensioni', icon: Star },
  { href: '/admin-panel/contatti', label: 'Contatti', icon: MessageSquare },
  { href: '/admin-panel/impostazioni', label: 'Impostazioni', icon: Settings },
]

export function AdminHeader({ user }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [sseConnected, setSseConnected] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const pathname = usePathname()

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.wav')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }, [])

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Fetch notifications (initial + fallback polling)
  const fetchNotifications = useCallback(async () => {
    try {
      const [appointmentsRes, contactsRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/contact')
      ])

      const notifs: Notification[] = []
      const now = new Date()
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      if (appointmentsRes.ok) {
        const appointments = await appointmentsRes.json()
        const imminent = appointments.filter((apt: { status: string; date: string; time: string }) => {
          if (apt.status !== 'confirmed') return false
          const aptDateStr = new Date(apt.date).toISOString().split('T')[0]
          if (aptDateStr !== todayStr) return false
          const [hours, minutes] = apt.time.split(':').map(Number)
          const aptTime = new Date(today)
          aptTime.setHours(hours, minutes, 0, 0)
          return aptTime >= now && aptTime <= oneHourFromNow
        })

        imminent.forEach((apt: { id: string; clientName: string; time: string; service?: { name: string } }) => {
          notifs.push({
            id: `imminent-${apt.id}`,
            type: 'imminent',
            title: `${apt.clientName} alle ${apt.time}`,
            message: apt.service?.name || 'Appuntamento',
            time: 'Prossima ora',
            link: '/admin-panel/appuntamenti'
          })
        })
      }

      if (contactsRes.ok) {
        const contacts = await contactsRes.json()
        const unread = contacts.filter((c: { status: string }) => c.status === 'new' || c.status === 'unread')
        if (unread.length > 0) {
          notifs.push({
            id: 'contacts-count',
            type: 'contact',
            title: `${unread.length} messagg${unread.length > 1 ? 'i' : 'io'} non lett${unread.length > 1 ? 'i' : 'o'}`,
            message: 'Da leggere',
            time: 'Adesso',
            link: '/admin-panel/contatti'
          })
        }
      }

      setNotifications((prev) => {
        // Keep real-time booking notifications, replace the rest
        const realtimeNotifs = prev.filter((n) => n.type === 'new_booking')
        return [...realtimeNotifs, ...notifs]
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // SSE connection for real-time notifications
  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>

    const connect = () => {
      const eventSource = new EventSource('/api/notifications/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setSseConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'new_booking') {
            const notif: Notification = {
              id: `booking-${data.appointmentId}-${Date.now()}`,
              type: 'new_booking',
              title: `Nuova prenotazione: ${data.clientName}`,
              message: `${data.serviceName} - ${data.time}`,
              time: 'Ora',
              link: '/admin-panel/appuntamenti',
            }

            setNotifications((prev) => [notif, ...prev])

            // Sound + Browser notification
            playNotificationSound()
            showBrowserNotification(
              'Nuova prenotazione!',
              `${data.clientName} - ${data.serviceName} alle ${data.time}`
            )
          }
        } catch {}
      }

      eventSource.onerror = () => {
        setSseConnected(false)
        eventSource.close()
        eventSourceRef.current = null
        // Reconnect after 5s
        reconnectTimeout = setTimeout(connect, 5000)
      }
    }

    connect()

    // Fallback polling every 60s (in case SSE disconnects)
    const pollInterval = setInterval(fetchNotifications, 60000)

    return () => {
      eventSourceRef.current?.close()
      clearTimeout(reconnectTimeout)
      clearInterval(pollInterval)
    }
  }, [fetchNotifications, playNotificationSound, showBrowserNotification])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking': return <Plus className="w-4 h-4 text-green-400" />
      case 'imminent': return <Clock className="w-4 h-4 text-[#d4a855]" />
      case 'contact': return <MessageSquare className="w-4 h-4 text-blue-400" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getPageTitle = () => {
    const item = menuItems.find((m) => {
      if (m.href === '/admin-panel') return pathname === '/admin-panel'
      return pathname.startsWith(m.href)
    })
    return item?.label || 'Dashboard'
  }

  return (
    <>
      <header className="h-16 border-b border-[rgba(244,102,47,0.15)] bg-[#0c0c0c]/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 relative z-[100]">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-white hover:text-[#F4662F] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-[rgba(255,255,255,0.6)] hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#F4662F] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden z-[9999] admin-fade-in">
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notifiche</h3>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <span className="text-xs text-[rgba(255,255,255,0.5)]">
                        {notifications.length} nuove
                      </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-red-500'}`} title={sseConnected ? 'Live' : 'Disconnesso'} />
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-[rgba(255,255,255,0.5)] text-sm">
                      Caricamento...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                        <Bell className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
                      </div>
                      <p className="text-sm text-[rgba(255,255,255,0.5)]">Nessuna notifica</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link}
                          onClick={() => setNotificationsOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-0 ${
                            notif.type === 'new_booking' ? 'bg-green-500/5' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            notif.type === 'new_booking' ? 'bg-green-500/20' : 'bg-[rgba(255,255,255,0.05)]'
                          }`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
                              {notif.message}
                            </p>
                          </div>
                          <span className="text-[10px] text-[rgba(255,255,255,0.4)] flex-shrink-0">
                            {notif.time}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.1)]">
                    <Link
                      href="/admin-panel/appuntamenti"
                      onClick={() => setNotificationsOpen(false)}
                      className="block text-center text-xs text-[#d4a855] hover:text-[#e5b966] transition-colors"
                    >
                      Vedi tutti gli appuntamenti
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View site */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)] hover:text-[#F4662F] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Vedi sito</span>
          </Link>

          {/* Mobile user avatar */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center text-sm font-bold text-[#0a0a0a]">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0c0c0c] border-r border-[rgba(244,102,47,0.15)] admin-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(244,102,47,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-[#0a0a0a]" />
                </div>
                <div>
                  <h1 className="font-cinzel text-lg font-bold text-white">Barber 99</h1>
                  <p className="text-xs text-[rgba(255,255,255,0.5)]">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[rgba(255,255,255,0.6)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation - all items from sidebar */}
            <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {menuItems.map((item) => {
                const Icon = item.icon
                const active =
                  item.href === '/admin-panel'
                    ? pathname === '/admin-panel'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[rgba(244,102,47,0.1)] text-[#F4662F]'
                        : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(244,102,47,0.15)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F4662F] to-[#D4521F] flex items-center justify-center text-sm font-bold text-[#0a0a0a]">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">{user?.email}</p>
                </div>
              </div>
              <form action="/admin-panel/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Esci
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
