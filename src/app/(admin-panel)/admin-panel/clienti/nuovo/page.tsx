import { ClientForm } from '@/components/admin-panel/ClientForm'

export default function NuovoClientePage() {
  return (
    <div className="max-w-4xl admin-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nuovo Cliente</h1>
        <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
          Aggiungi un nuovo cliente al database
        </p>
      </div>

      <ClientForm isNew />
    </div>
  )
}
