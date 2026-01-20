import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { hashPassword, createClientToken, setClientCookie, isValidEmail, isValidPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      )
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Find existing client by email (must exist from a previous booking)
    const clients = await payload.find({
      collection: 'clients',
      where: {
        email: { equals: email.toLowerCase() },
      },
      limit: 1,
    })

    if (clients.docs.length === 0) {
      return NextResponse.json(
        { error: 'Nessun account trovato con questa email. Effettua prima una prenotazione.' },
        { status: 404 }
      )
    }

    const client = clients.docs[0]

    // Check if already registered
    if (client.isRegistered) {
      return NextResponse.json(
        { error: 'Questo account è già registrato. Usa il login.' },
        { status: 400 }
      )
    }

    // Hash password and update client
    const hashedPassword = await hashPassword(password)

    await payload.update({
      collection: 'clients',
      id: client.id,
      data: {
        password: hashedPassword,
        isRegistered: true,
      },
    })

    // Create JWT token and log in automatically
    const token = await createClientToken({
      clientId: String(client.id),
      email: client.email as string,
      name: client.name as string,
    })

    await setClientCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Registrazione completata con successo',
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    )
  }
}
