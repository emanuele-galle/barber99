export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Scissors, Clock, Euro } from 'lucide-react'
import { DeleteButton } from '@/components/admin-panel/DeleteButton'

async function getServices() {
  const payload = await getPayload({ config })
  const services = await payload.find({
    collection: 'services',
    sort: 'order',
    limit: 100,
  })
  return services.docs
}

const categoryLabels: Record<string, string> = {
  haircut: 'Taglio',
  beard: 'Barba',
  styling: 'Styling',
  treatment: 'Trattamento',
  package: 'Pacchetto',
}

export default async function ServiziPage() {
  const services = await getServices()

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Servizi</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Gestisci i servizi offerti dal salone
          </p>
        </div>
        <Link href="/admin-panel/servizi/nuovo" className="admin-btn admin-btn-primary">
          <Plus className="w-5 h-5" />
          Nuovo Servizio
        </Link>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="admin-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-[rgba(212,168,85,0.1)] flex items-center justify-center flex-shrink-0">
                <Scissors className="w-6 h-6 text-[#d4a855]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {service.name}
                  </h3>
                  {service.featured && (
                    <span className="admin-badge admin-badge-gold">In evidenza</span>
                  )}
                  {!service.active && (
                    <span className="admin-badge admin-badge-error">Disattivo</span>
                  )}
                </div>
                <p className="text-sm text-[rgba(255,255,255,0.5)] line-clamp-1">
                  {service.shortDescription || 'Nessuna descrizione'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-[rgba(255,255,255,0.6)]">
                    <Euro className="w-4 h-4" />
                    {service.price}
                  </span>
                  <span className="flex items-center gap-1 text-[rgba(255,255,255,0.6)]">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </span>
                  <span className="admin-badge admin-badge-gold">
                    {categoryLabels[service.category as string] || service.category}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <Link
                  href={`/admin-panel/servizi/${service.id}`}
                  className="admin-btn admin-btn-secondary py-2 px-3"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Modifica</span>
                </Link>
                <DeleteButton collection="services" id={String(service.id)} name={service.name as string} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center">
            <Scissors className="w-8 h-8 text-[#d4a855]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nessun servizio</h3>
          <p className="text-[rgba(255,255,255,0.5)] mb-6">
            Inizia aggiungendo il primo servizio del salone
          </p>
          <Link href="/admin-panel/servizi/nuovo" className="admin-btn admin-btn-primary">
            <Plus className="w-5 h-5" />
            Aggiungi Servizio
          </Link>
        </div>
      )}
    </div>
  )
}
