import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST - Chiama il prossimo in coda (passa da inqueue a inservice)
export async function POST() {
  try {
    const payload = await getPayload({ config })

    // Verifica autenticazione
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Trova il primo in coda
    const inQueue = await payload.find({
      collection: 'appointments',
      where: {
        appointmentType: { equals: 'walkin' },
        status: { equals: 'inqueue' },
        date: {
          greater_than_equal: today.toISOString(),
          less_than: tomorrow.toISOString(),
        },
      },
      sort: 'queuePosition',
      limit: 1,
      depth: 2,
    })

    if (inQueue.docs.length === 0) {
      return NextResponse.json({ error: 'Nessuno in coda' }, { status: 404 })
    }

    const nextClient = inQueue.docs[0]

    // Aggiorna lo stato a "in servizio"
    const updated = await payload.update({
      collection: 'appointments',
      id: nextClient.id,
      data: {
        status: 'inservice',
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      },
    })

    return NextResponse.json({
      message: 'Cliente chiamato',
      client: updated,
    })
  } catch (error) {
    console.error('Error calling next:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
