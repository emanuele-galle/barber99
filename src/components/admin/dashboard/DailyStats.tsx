'use client'

import { Euro, Calendar, CheckCircle, Clock } from 'lucide-react'

interface DailyStatsProps {
  estimatedRevenue: number
  totalAppointments: number
  completedAppointments: number
  upcomingCount: number
}

export function DailyStats({
  estimatedRevenue,
  totalAppointments,
  completedAppointments,
  upcomingCount,
}: DailyStatsProps) {
  const stats = [
    {
      label: 'Stimato Oggi',
      value: `€ ${estimatedRevenue}`,
      icon: Euro,
      color: '#d4a855',
    },
    {
      label: 'Appuntamenti',
      value: totalAppointments.toString(),
      icon: Calendar,
      color: '#3b82f6',
    },
    {
      label: 'Completati',
      value: completedAppointments.toString(),
      icon: CheckCircle,
      color: '#22c55e',
    },
    {
      label: 'In Arrivo',
      value: upcomingCount.toString(),
      icon: Clock,
      color: upcomingCount > 0 ? '#d4a855' : '#6b7280',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="admin-card p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <Icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xs text-[rgba(255,255,255,0.5)]">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
