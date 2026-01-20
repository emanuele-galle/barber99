'use client'

import React from 'react'
import RecentActivity from './RecentActivity'
import TodaySchedule from './TodaySchedule'

const DashboardLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}
    >
      <TodaySchedule />
      <RecentActivity />
    </div>
  )
}

export default DashboardLayout
