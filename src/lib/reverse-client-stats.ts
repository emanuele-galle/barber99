import type { Payload } from 'payload'

/**
 * Reverse client statistics when deleting a past appointment.
 * Used by both single DELETE and bulk-delete endpoints.
 */
export async function reverseClientStats(
  payload: Payload,
  appointment: {
    id: string
    client?: { id: string; totalVisits?: number; totalSpent?: number; noShowCount?: number; tags?: string[] } | string | null
    status: string
    service?: { id: string; price?: number; name?: string } | string | null
    date: string
    time: string
    clientName?: string
  }
): Promise<void> {
  if (!appointment.client || typeof appointment.client === 'string') return

  const client = appointment.client
  const clientId = client.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {}

  if (appointment.status === 'completed') {
    // Decrement totalVisits
    updates.totalVisits = Math.max((client.totalVisits || 0) - 1, 0)

    // Subtract service price from totalSpent
    let price = 0
    if (appointment.service && typeof appointment.service !== 'string') {
      price = appointment.service.price || 0
    }
    updates.totalSpent = Math.max((client.totalSpent || 0) - price, 0)

    // Recalculate lastVisit: find the most recent completed appointment for this client (excluding current)
    try {
      const remaining = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            { client: { equals: clientId } },
            { status: { equals: 'completed' } },
            { id: { not_equals: appointment.id } },
          ],
        },
        sort: '-date',
        limit: 1,
        depth: 0,
      })
      updates.lastVisit = remaining.docs.length > 0 ? remaining.docs[0].date : null
    } catch {
      updates.lastVisit = null
    }

    // Tag transition: regular → new if visits drops to 0
    if (updates.totalVisits === 0 && client.tags?.includes('regular')) {
      updates.tags = client.tags.filter((t: string) => t !== 'regular').concat(['new'])
    }
  } else if (appointment.status === 'noshow') {
    updates.noShowCount = Math.max((client.noShowCount || 0) - 1, 0)
  }

  if (Object.keys(updates).length > 0) {
    await payload.update({
      collection: 'clients',
      id: clientId,
      data: updates,
    })
  }
}
