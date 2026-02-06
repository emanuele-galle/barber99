export const dynamic = 'force-dynamic'

import { ServiceForm } from '@/components/admin-panel/ServiceForm'

export default function NuovoServizioPage() {
  return (
    <div className="max-w-3xl admin-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nuovo Servizio</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          Aggiungi un nuovo servizio al listino
        </p>
      </div>

      <ServiceForm isNew />
    </div>
  )
}
