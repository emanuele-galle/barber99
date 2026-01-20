export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { ServiceForm } from '@/components/admin-panel/ServiceForm'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getService(id: string) {
  const payload = await getPayload({ config })
  try {
    const service = await payload.findByID({
      collection: 'services',
      id,
    })
    return service
  } catch {
    return null
  }
}

export default async function ModificaServizioPage({ params }: PageProps) {
  const { id } = await params
  const service = await getService(id)

  if (!service) {
    notFound()
  }

  return (
    <div className="max-w-3xl admin-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Modifica Servizio</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          Modifica i dettagli del servizio
        </p>
      </div>

      <ServiceForm
        service={{
          id: String(service.id),
          name: service.name as string,
          slug: service.slug as string,
          shortDescription: service.shortDescription as string,
          price: service.price as number,
          duration: service.duration as number,
          category: service.category as string,
          icon: service.icon as string,
          featured: service.featured as boolean,
          active: service.active as boolean,
          order: service.order as number,
        }}
      />
    </div>
  )
}
