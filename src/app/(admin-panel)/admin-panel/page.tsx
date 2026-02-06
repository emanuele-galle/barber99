export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { TodayHeader } from '@/components/admin/dashboard/TodayHeader'
import { TodayTimeline } from '@/components/admin/dashboard/TodayTimeline'
import { QuickActions } from '@/components/admin/dashboard/QuickActionsNew'
import { UpcomingAppointments } from '@/components/admin/dashboard/PendingConfirmations'
import { DailyStats } from '@/components/admin/dashboard/DailyStats'
import { ArrowRight, Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  date: string
  time: string
  status: string
  service: { id: string; name: string; price?: number; duration?: number } | string
  barber: { id: string; name: string } | string
}

async function getDashboardData() {
  const payload = await getPayload({ config })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get today's appointments
  const todayAppointments = await payload.find({
    collection: 'appointments',
    where: {
      date: {
        greater_than_equal: today.toISOString(),
        less_than: tomorrow.toISOString(),
      },
    },
    sort: 'time',
    limit: 50,
    depth: 2,
  })

  // Count walk-ins in queue today
  const queueAppointments = await payload.count({
    collection: 'appointments',
    where: {
      and: [
        { appointmentType: { equals: 'walkin' } },
        { status: { equals: 'inqueue' } },
        { date: { greater_than_equal: today.toISOString() } },
        { date: { less_than: tomorrow.toISOString() } },
      ],
    },
  })

  // Get opening hours for today
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayOfWeekString = dayNames[today.getDay()]
  const openingHours = await payload.find({
    collection: 'opening-hours',
    where: { dayOfWeek: { equals: dayOfWeekString } },
    limit: 1,
  })

  // Get recent contacts
  const recentContacts = await payload.find({
    collection: 'contact-submissions',
    where: { status: { equals: 'new' } },
    sort: '-createdAt',
    limit: 3,
  })

  // Get reviews stats
  const reviews = await payload.find({
    collection: 'reviews',
    limit: 100,
  })

  const avgRating =
    reviews.docs.length > 0
      ? reviews.docs.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.docs.length
      : 0

  return {
    todayAppointments: todayAppointments.docs as Appointment[],
    openingTime: openingHours.docs[0]?.openTime || '09:00',
    closingTime: openingHours.docs[0]?.closeTime || '19:00',
    isOpenToday: openingHours.docs[0]?.isClosed ? false : true,
    recentContacts: recentContacts.docs,
    avgRating: avgRating.toFixed(1),
    reviewsCount: reviews.docs.length,
    queueCount: queueAppointments.totalDocs,
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  // Find next upcoming appointment
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const upcomingAppointments = data.todayAppointments.filter(
    (apt) =>
      apt.time >= currentTime &&
      apt.status !== 'cancelled' &&
      apt.status !== 'completed' &&
      apt.status !== 'noshow'
  )

  const nextAppointment = upcomingAppointments[0]
    ? {
        id: upcomingAppointments[0].id,
        clientName: upcomingAppointments[0].clientName,
        time: upcomingAppointments[0].time,
        serviceName:
          typeof upcomingAppointments[0].service === 'object'
            ? upcomingAppointments[0].service.name
            : 'Servizio',
        serviceDuration:
          typeof upcomingAppointments[0].service === 'object'
            ? upcomingAppointments[0].service.duration || 30
            : 30,
      }
    : null

  // Calculate daily stats
  const activeToday = data.todayAppointments.filter(
    (apt) => apt.status !== 'cancelled' && apt.status !== 'noshow'
  )
  const completedToday = activeToday.filter((apt) => apt.status === 'completed')

  // Calculate estimated revenue
  const estimatedRevenue = activeToday.reduce((sum, apt) => {
    if (typeof apt.service === 'object' && apt.service.price) {
      return sum + apt.service.price
    }
    return sum
  }, 0)

  // Format timeline appointments
  const timelineAppointments = data.todayAppointments
    .filter((apt) => apt.status !== 'cancelled')
    .map((apt) => ({
      id: apt.id,
      time: apt.time,
      clientName: apt.clientName,
      serviceName: typeof apt.service === 'object' ? apt.service.name : 'Servizio',
      serviceDuration: typeof apt.service === 'object' ? apt.service.duration || 30 : 30,
      status: apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'noshow',
      barberName: typeof apt.barber === 'object' ? apt.barber.name : undefined,
    }))

  // Format upcoming appointments for sidebar
  const upcomingList = upcomingAppointments.map((apt) => ({
    id: apt.id,
    clientName: apt.clientName,
    clientPhone: apt.clientPhone,
    time: apt.time,
    serviceName: typeof apt.service === 'object' ? apt.service.name : 'Servizio',
  }))

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Today Header */}
      <TodayHeader nextAppointment={nextAppointment} />

      {/* Daily Stats */}
      <DailyStats
        estimatedRevenue={estimatedRevenue}
        totalAppointments={activeToday.length}
        completedAppointments={completedToday.length}
        upcomingCount={upcomingAppointments.length}
      />

      {/* Quick Actions */}
      <QuickActions queueCount={data.queueCount} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TodayTimeline
            appointments={timelineAppointments}
            openingTime={data.openingTime}
            closingTime={data.closingTime}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <UpcomingAppointments appointments={upcomingList} />

          {/* Recent Contacts */}
          {data.recentContacts.length > 0 && (
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Nuovi Contatti</h3>
                <Link
                  href="/admin-panel/contatti"
                  className="text-sm text-[#d4a855] hover:text-[#e8c882] flex items-center gap-1"
                >
                  Vedi tutti
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {data.recentContacts.map((contact: Record<string, unknown>) => (
                  <div
                    key={contact.id as string}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {contact.name as string}
                      </p>
                      <p className="text-xs text-[rgba(255,255,255,0.5)] truncate">
                        {contact.email as string}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating Card */}
          <div className="admin-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-[rgba(255,255,255,0.6)]">Valutazione Media</p>
                <p className="text-3xl font-bold text-white">{data.avgRating}</p>
                <p className="text-xs text-[rgba(255,255,255,0.5)]">
                  {data.reviewsCount} recensioni
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
