export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { AppointmentsClient } from './AppointmentsClient'

async function getAppointments() {
  const payload = await getPayload({ config })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appointments = await payload.find({
    collection: 'appointments',
    sort: 'date,time',
    limit: 500,
    depth: 2,
    where: {
      date: { greater_than_equal: today.toISOString() },
    },
  })
  return appointments.docs
}

export default async function AppuntamentiPage() {
  const appointments = await getAppointments()

  // Serialize for client component
  const serializedAppointments = appointments.map((apt) => ({
    id: String(apt.id),
    clientName: apt.clientName as string,
    clientEmail: apt.clientEmail as string,
    clientPhone: apt.clientPhone as string,
    date: apt.date as string,
    time: apt.time as string,
    status: apt.status as string,
    notes: apt.notes as string | undefined,
    service: apt.service ? {
      name: (apt.service as { name?: string }).name || 'Servizio',
      duration: (apt.service as { duration?: number }).duration,
    } : null,
    barber: (apt.barber as string) || 'Cosimo Pisani',
  }))

  return (
    <AppointmentsClient
      initialAppointments={serializedAppointments}
    />
  )
}
