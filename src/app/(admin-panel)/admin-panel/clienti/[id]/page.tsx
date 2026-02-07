export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { ClientForm } from '@/components/admin-panel/ClientForm'
import { DeleteButton } from '@/components/admin-panel/DeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getClient(id: string) {
  const payload = await getPayload({ config })
  try {
    const client = await payload.findByID({
      collection: 'clients',
      id,
      depth: 2, // Include relationship data
    })
    return client
  } catch {
    return null
  }
}

export default async function ModificaClientePage({ params }: PageProps) {
  const { id } = await params
  const client = await getClient(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="max-w-4xl admin-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Modifica Cliente</h1>
          <p className="text-[rgba(255,255,255,0.6)] text-sm mt-1">
            Modifica i dettagli del cliente
          </p>
        </div>
        <DeleteButton collection="clients" id={String(client.id)} name={client.name as string} redirectTo="/admin-panel/clienti" />
      </div>

      <ClientForm
        client={{
          id: String(client.id),
          name: client.name as string,
          phone: client.phone as string,
          email: client.email as string | undefined,
          preferences: client.preferences as {
            hairNotes?: string
            preferredServices?: string[] | { id: string }[]
          } | undefined,
          notes: client.notes as string | undefined,
          tags: client.tags as string[] | undefined,
          totalVisits: client.totalVisits as number | undefined,
          lastVisit: client.lastVisit as string | undefined,
          noShowCount: client.noShowCount as number | undefined,
          totalSpent: client.totalSpent as number | undefined,
        }}
      />
    </div>
  )
}
