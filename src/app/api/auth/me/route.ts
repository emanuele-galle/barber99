import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getClientFromCookie } from '@/lib/auth'

export async function GET() {
  try {
    const tokenPayload = await getClientFromCookie()

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    // Fetch full client data
    const payload = await getPayload({ config })
    const client = await payload.findByID({
      collection: 'clients',
      id: tokenPayload.clientId,
      depth: 1, // Include preferences.preferredBarber etc.
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente non trovato' },
        { status: 404 }
      )
    }

    // Return client data (without password)
    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        preferences: client.preferences,
        totalVisits: client.totalVisits,
        lastVisit: client.lastVisit,
        tags: client.tags,
      },
    })
  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero dei dati' },
      { status: 500 }
    )
  }
}
