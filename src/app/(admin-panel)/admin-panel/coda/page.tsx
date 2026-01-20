export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { WalkinQueue } from './WalkinQueue'

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

async function getQueueData() {
  const payload = await getPayload({ config })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get walk-ins in queue
  const walkins = await payload.find({
    collection: 'appointments',
    where: {
      appointmentType: { equals: 'walkin' },
      status: { in: ['inqueue', 'inservice'] },
      date: {
        greater_than_equal: today.toISOString(),
        less_than: tomorrow.toISOString(),
      },
    },
    sort: 'queuePosition',
    depth: 2,
  })

  // Get services for the form
  const services = await payload.find({
    collection: 'services',
    where: { active: { equals: true } },
    sort: 'order',
    limit: 50,
  })

  return {
    walkins: walkins.docs,
    services: services.docs as Service[],
  }
}

export default async function CodaPage() {
  const data = await getQueueData()

  const formattedWalkins = data.walkins.map((w) => ({
    id: String(w.id),
    clientName: w.clientName as string,
    clientPhone: (w.clientPhone as string) || '',
    serviceName: typeof w.service === 'object' && w.service ? (w.service as Service).name : 'Servizio',
    serviceDuration: typeof w.service === 'object' && w.service ? (w.service as Service).duration : 30,
    barberName: (w.barber as string) || 'Cosimo Pisani',
    status: w.status as string,
    queuePosition: (w.queuePosition as number) || 0,
    checkedInAt: w.checkedInAt as string,
    estimatedWaitMinutes: (w.estimatedWaitMinutes as number) || 0,
  }))

  const servicesForForm = data.services.map((s) => ({
    id: String(s.id),
    name: s.name,
    duration: s.duration,
  }))

  return (
    <div className="space-y-6 admin-fade-in">
      <WalkinQueue
        initialWalkins={formattedWalkins}
        services={servicesForForm}
      />
    </div>
  )
}
