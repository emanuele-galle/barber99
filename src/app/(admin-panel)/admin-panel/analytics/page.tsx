export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Euro,
  Calendar,
  UserX,
  Scissors,
  Clock,
  Users,
  UserPlus,
  Repeat,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
}

interface Appointment {
  id: string
  status: string
  date: string
  service: Service | string
  createdAt: string
}

async function getAnalyticsData() {
  const payload = await getPayload({ config })

  const now = new Date()

  // This week
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // Last week
  const startOfLastWeek = new Date(startOfWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
  const endOfLastWeek = new Date(startOfWeek)

  // This month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Last month
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Fetch all appointments for analytics
  const [
    thisWeekAppts,
    lastWeekAppts,
    thisMonthAppts,
    lastMonthAppts,
    allServices,
    allClients,
  ] = await Promise.all([
    payload.find({
      collection: 'appointments',
      where: {
        date: { greater_than_equal: startOfWeek.toISOString() },
      },
      limit: 500,
      depth: 2,
    }),
    payload.find({
      collection: 'appointments',
      where: {
        date: {
          greater_than_equal: startOfLastWeek.toISOString(),
          less_than: endOfLastWeek.toISOString(),
        },
      },
      limit: 500,
      depth: 2,
    }),
    payload.find({
      collection: 'appointments',
      where: {
        date: { greater_than_equal: startOfMonth.toISOString() },
      },
      limit: 1000,
      depth: 2,
    }),
    payload.find({
      collection: 'appointments',
      where: {
        date: {
          greater_than_equal: startOfLastMonth.toISOString(),
          less_than: endOfLastMonth.toISOString(),
        },
      },
      limit: 1000,
      depth: 2,
    }),
    payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      limit: 50,
    }),
    payload.find({
      collection: 'clients',
      limit: 1000,
    }),
  ])

  // Calculate metrics
  const calculateRevenue = (appts: Appointment[]) => {
    return appts
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => {
        if (typeof a.service === 'object' && a.service?.price) {
          return sum + a.service.price
        }
        return sum
      }, 0)
  }

  const calculateNoShowRate = (appts: Appointment[]) => {
    const total = appts.length
    const noShows = appts.filter((a) => a.status === 'noshow').length
    return total > 0 ? (noShows / total) * 100 : 0
  }

  const calculateCompletedCount = (appts: Appointment[]) => {
    return appts.filter((a) => a.status === 'completed').length
  }

  // Service popularity
  const serviceCounts: Record<string, { name: string; count: number }> = {}
  thisMonthAppts.docs.forEach((appt) => {
    const apt = appt as Appointment
    if (typeof apt.service === 'object' && apt.service) {
      const serviceId = apt.service.id
      if (!serviceCounts[serviceId]) {
        serviceCounts[serviceId] = { name: apt.service.name, count: 0 }
      }
      serviceCounts[serviceId].count++
    }
  })

  const topServices = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Hour distribution for heatmap
  const hourCounts: Record<string, number> = {}
  thisMonthAppts.docs.forEach((appt) => {
    const apt = appt as Appointment & { time?: string }
    const date = new Date(apt.date)
    const hour = apt.time ? parseInt(apt.time.split(':')[0], 10) : date.getHours()
    const dayHour = `${date.getDay()}-${hour}`
    hourCounts[dayHour] = (hourCounts[dayHour] || 0) + 1
  })

  // New vs Returning clients analysis (this month)
  const clientStats = { new: 0, returning: 0 }
  const processedClients = new Set<string>()

  thisMonthAppts.docs.forEach((appt) => {
    const apt = appt as Appointment & {
      client?: { id: string; totalVisits?: number } | string
    }
    if (apt.status === 'completed' && apt.client) {
      const clientId = typeof apt.client === 'string' ? apt.client : apt.client.id
      if (!processedClients.has(clientId)) {
        processedClients.add(clientId)
        const totalVisits =
          typeof apt.client === 'object' ? apt.client.totalVisits || 0 : 0
        // If totalVisits is 1 or less, they're new (current visit is their first)
        if (totalVisits <= 1) {
          clientStats.new++
        } else {
          clientStats.returning++
        }
      }
    }
  })

  return {
    thisWeek: {
      revenue: calculateRevenue(thisWeekAppts.docs as Appointment[]),
      appointments: calculateCompletedCount(thisWeekAppts.docs as Appointment[]),
      noShowRate: calculateNoShowRate(thisWeekAppts.docs as Appointment[]),
    },
    lastWeek: {
      revenue: calculateRevenue(lastWeekAppts.docs as Appointment[]),
      appointments: calculateCompletedCount(lastWeekAppts.docs as Appointment[]),
      noShowRate: calculateNoShowRate(lastWeekAppts.docs as Appointment[]),
    },
    thisMonth: {
      revenue: calculateRevenue(thisMonthAppts.docs as Appointment[]),
      appointments: calculateCompletedCount(thisMonthAppts.docs as Appointment[]),
      noShowRate: calculateNoShowRate(thisMonthAppts.docs as Appointment[]),
    },
    lastMonth: {
      revenue: calculateRevenue(lastMonthAppts.docs as Appointment[]),
      appointments: calculateCompletedCount(lastMonthAppts.docs as Appointment[]),
      noShowRate: calculateNoShowRate(lastMonthAppts.docs as Appointment[]),
    },
    topServices,
    hourCounts,
    clientStats,
    totalClients: allClients.totalDocs,
  }
}

function MetricCard({
  label,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  color,
}: {
  label: string
  value: number
  previousValue?: number
  format?: 'number' | 'currency' | 'percent'
  icon: React.ElementType
  color: string
}) {
  const formatValue = (v: number) => {
    switch (format) {
      case 'currency':
        return `€ ${v.toFixed(0)}`
      case 'percent':
        return `${v.toFixed(1)}%`
      default:
        return v.toString()
    }
  }

  const change =
    previousValue !== undefined && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : 0

  const isPositive = format === 'percent' ? change < 0 : change > 0 // For no-show rate, decrease is good

  return (
    <div className="admin-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(change).toFixed(0)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{formatValue(value)}</p>
      <p className="text-sm text-[rgba(255,255,255,0.5)]">{label}</p>
    </div>
  )
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  const hours = Array.from({ length: 11 }, (_, i) => i + 9) // 9-19

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[rgba(255,255,255,0.5)] mt-1">
          Statistiche e performance dello studio
        </p>
      </div>

      {/* This Week Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#d4a855]" />
          Questa Settimana
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Fatturato"
            value={data.thisWeek.revenue}
            previousValue={data.lastWeek.revenue}
            format="currency"
            icon={Euro}
            color="#d4a855"
          />
          <MetricCard
            label="Appuntamenti Completati"
            value={data.thisWeek.appointments}
            previousValue={data.lastWeek.appointments}
            icon={Calendar}
            color="#22c55e"
          />
          <MetricCard
            label="No-Show Rate"
            value={data.thisWeek.noShowRate}
            previousValue={data.lastWeek.noShowRate}
            format="percent"
            icon={UserX}
            color="#ef4444"
          />
        </div>
      </div>

      {/* This Month Stats */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[#d4a855]" />
          Questo Mese
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Fatturato"
            value={data.thisMonth.revenue}
            previousValue={data.lastMonth.revenue}
            format="currency"
            icon={Euro}
            color="#d4a855"
          />
          <MetricCard
            label="Appuntamenti Completati"
            value={data.thisMonth.appointments}
            previousValue={data.lastMonth.appointments}
            icon={Calendar}
            color="#22c55e"
          />
          <MetricCard
            label="No-Show Rate"
            value={data.thisMonth.noShowRate}
            previousValue={data.lastMonth.noShowRate}
            format="percent"
            icon={UserX}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Client Analysis */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#d4a855]" />
          Analisi Clienti
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="admin-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{data.totalClients}</p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Clienti Totali</p>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-green-400">
                {data.clientStats.new + data.clientStats.returning > 0
                  ? Math.round(
                      (data.clientStats.new /
                        (data.clientStats.new + data.clientStats.returning)) *
                        100,
                    )
                  : 0}
                %
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{data.clientStats.new}</p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Nuovi Clienti (Mese)</p>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Repeat className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm text-purple-400">
                {data.clientStats.new + data.clientStats.returning > 0
                  ? Math.round(
                      (data.clientStats.returning /
                        (data.clientStats.new + data.clientStats.returning)) *
                        100,
                    )
                  : 0}
                %
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{data.clientStats.returning}</p>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Clienti Ricorrenti (Mese)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#d4a855]" />
            Servizi Più Richiesti
          </h3>
          {data.topServices.length > 0 ? (
            <div className="space-y-3">
              {data.topServices.map((service, index) => (
                <div key={service.name} className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-[#d4a855] text-black'
                        : 'bg-[rgba(255,255,255,0.1)] text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{service.name}</p>
                    <div className="mt-1 h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#d4a855] rounded-full"
                        style={{
                          width: `${(service.count / data.topServices[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[rgba(255,255,255,0.5)] font-mono">{service.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[rgba(255,255,255,0.5)] text-center py-8">
              Dati insufficienti per questo mese
            </p>
          )}
        </div>

        {/* Peak Hours Heatmap */}
        <div className="admin-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#d4a855]" />
            Ore di Punta
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Days header */}
              <div className="flex mb-2">
                <div className="w-12" />
                {days.map((day) => (
                  <div
                    key={day}
                    className="flex-1 text-center text-xs text-[rgba(255,255,255,0.5)]"
                  >
                    {day}
                  </div>
                ))}
              </div>
              {/* Hours grid */}
              {hours.map((hour) => (
                <div key={hour} className="flex mb-1">
                  <div className="w-12 text-xs text-[rgba(255,255,255,0.5)] flex items-center">
                    {hour}:00
                  </div>
                  {days.map((_, dayIndex) => {
                    const count = data.hourCounts[`${dayIndex}-${hour}`] || 0
                    const maxCount = Math.max(...Object.values(data.hourCounts), 1)
                    const intensity = count / maxCount
                    return (
                      <div key={dayIndex} className="flex-1 p-0.5">
                        <div
                          className="h-6 rounded"
                          style={{
                            backgroundColor:
                              count > 0
                                ? `rgba(212, 168, 85, ${0.2 + intensity * 0.8})`
                                : 'rgba(255, 255, 255, 0.05)',
                          }}
                          title={`${days[dayIndex]} ${hour}:00 - ${count} ${count === 1 ? 'appuntamento' : 'appuntamenti'}`}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.4)] mt-4 text-center">
            Intensità del colore = numero di appuntamenti
          </p>
        </div>
      </div>
    </div>
  )
}
