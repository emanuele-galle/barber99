import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET - Lista walk-in in coda
export async function GET() {
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

    return NextResponse.json(walkins)
  } catch (error) {
    console.error('Error fetching walkins:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}

// POST - Crea nuovo walk-in
export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Verifica autenticazione
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { clientName, clientPhone, serviceId, barberId, notes } = body

    if (!clientName || !serviceId) {
      return NextResponse.json(
        { error: 'Nome cliente e servizio sono obbligatori' },
        { status: 400 }
      )
    }

    // Trova la prossima posizione in coda
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingWalkins = await payload.find({
      collection: 'appointments',
      where: {
        appointmentType: { equals: 'walkin' },
        status: { in: ['inqueue', 'inservice'] },
        date: {
          greater_than_equal: today.toISOString(),
          less_than: tomorrow.toISOString(),
        },
      },
      sort: '-queuePosition',
      limit: 1,
    })

    const nextPosition = existingWalkins.docs.length > 0
      ? ((existingWalkins.docs[0].queuePosition as number) || 0) + 1
      : 1

    // Calcola tempo di attesa stimato basato sulla coda
    const inQueueCount = await payload.count({
      collection: 'appointments',
      where: {
        appointmentType: { equals: 'walkin' },
        status: { equals: 'inqueue' },
        date: {
          greater_than_equal: today.toISOString(),
          less_than: tomorrow.toISOString(),
        },
      },
    })

    // Stima: ~20 minuti per cliente in coda
    const estimatedWait = inQueueCount.totalDocs * 20

    // Crea il walk-in
    const walkin = await payload.create({
      collection: 'appointments',
      data: {
        clientName,
        clientPhone: clientPhone || '',
        clientEmail: 'walkin@barber99.it', // Email placeholder per walk-in
        service: serviceId,
        barber: barberId || null,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        status: 'inqueue',
        appointmentType: 'walkin',
        queuePosition: nextPosition,
        checkedInAt: new Date().toISOString(),
        estimatedWaitMinutes: estimatedWait,
        notes: notes || '',
      },
    })

    return NextResponse.json(walkin, { status: 201 })
  } catch (error) {
    console.error('Error creating walkin:', error)
    return NextResponse.json({ error: 'Errore durante creazione walk-in' }, { status: 500 })
  }
}
