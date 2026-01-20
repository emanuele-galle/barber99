export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { User, Phone, Calendar, Star, Search, Plus, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/admin-panel/EmptyState'

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  totalVisits: number
  lastVisit?: string
  noShowCount: number
  tags?: string[]
}

interface PageProps {
  searchParams: Promise<{ search?: string; tag?: string }>
}

async function getClients(search?: string, tag?: string) {
  const payload = await getPayload({ config })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (search) {
    where.or = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ]
  }

  if (tag) {
    where.tags = { contains: tag }
  }

  const clients = await payload.find({
    collection: 'clients',
    where: Object.keys(where).length > 0 ? where : undefined,
    sort: '-lastVisit',
    limit: 50,
    depth: 1,
  })

  return clients.docs as Client[]
}

export default async function ClientiPage({ searchParams }: PageProps) {
  const params = await searchParams
  const clients = await getClients(params.search, params.tag)

  const tagColors: Record<string, string> = {
    vip: 'bg-yellow-500/20 text-yellow-400',
    new: 'bg-green-500/20 text-green-400',
    regular: 'bg-blue-500/20 text-blue-400',
    inactive: 'bg-red-500/20 text-red-400',
  }

  const tagLabels: Record<string, string> = {
    vip: 'VIP',
    new: 'Nuovo',
    regular: 'Abituale',
    inactive: 'Inattivo',
  }

  return (
    <div className="space-y-6 admin-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clienti</h1>
          <p className="text-[rgba(255,255,255,0.5)] mt-1">
            Gestisci i clienti e le loro preferenze
          </p>
        </div>

        <Link href="/admin-panel/clienti/nuovo" className="admin-btn admin-btn-primary">
          <Plus className="w-5 h-5" />
          Nuovo Cliente
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="admin-card p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(255,255,255,0.4)]" />
            <input
              type="text"
              name="search"
              defaultValue={params.search || ''}
              placeholder="Cerca per nome, telefono o email..."
              className="admin-input w-full pl-10"
            />
          </div>
          <select
            name="tag"
            defaultValue={params.tag || ''}
            className="admin-input w-full sm:w-auto"
          >
            <option value="">Tutti i clienti</option>
            <option value="vip">VIP</option>
            <option value="new">Nuovi</option>
            <option value="regular">Abituali</option>
            <option value="inactive">Inattivi</option>
          </select>
          <button type="submit" className="admin-btn admin-btn-secondary">
            Filtra
          </button>
        </form>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <EmptyState
          preset="clients"
          actionLabel="Aggiungi Cliente"
          actionHref="/admin-panel/clienti/nuovo"
        />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/admin-panel/clienti/${client.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[rgba(212,168,85,0.1)] flex items-center justify-center text-[#d4a855] font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{client.name}</p>
                    {client.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 text-xs font-medium rounded ${tagColors[tag] || 'bg-gray-500/20 text-gray-400'}`}
                      >
                        {tagLabels[tag] || tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-[rgba(255,255,255,0.5)]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {client.totalVisits} visite
                    </span>
                    {client.lastVisit && (
                      <span className="hidden sm:flex items-center gap-1">
                        Ultima: {new Date(client.lastVisit).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  {client.noShowCount > 0 && (
                    <div className="text-center">
                      <p className="text-red-400 font-medium">{client.noShowCount}</p>
                      <p className="text-[rgba(255,255,255,0.4)] text-xs">No-show</p>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.3)] group-hover:text-[#d4a855] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-white">{clients.length}</p>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Clienti totali</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {clients.filter((c) => c.tags?.includes('vip')).length}
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">VIP</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {clients.filter((c) => c.tags?.includes('new')).length}
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Nuovi</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {clients.filter((c) => c.tags?.includes('inactive')).length}
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">Inattivi</p>
        </div>
      </div>
    </div>
  )
}
