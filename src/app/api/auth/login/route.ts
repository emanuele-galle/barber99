import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyPassword, createClientToken, setClientCookie, isValidEmail, needsRehash, hashPassword } from '@/lib/auth'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req)
    const { allowed } = rateLimit(`login:${ip}`, RATE_LIMITS.login)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

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

    // Find client by email
    const payload = await getPayload({ config })
    const clients = await payload.find({
      collection: 'clients',
      where: {
        email: { equals: email.toLowerCase() },
        isRegistered: { equals: true },
      },
      limit: 1,
    })

    if (clients.docs.length === 0) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    const client = clients.docs[0]

    // Verify password
    if (!client.password) {
      return NextResponse.json(
        { error: 'Account non configurato correttamente' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, client.password as string)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Transparent rehash: migrate legacy SHA-256 to bcrypt
    if (needsRehash(client.password as string)) {
      const newHash = await hashPassword(password)
      await payload.update({
        collection: 'clients',
        id: client.id,
        data: { password: newHash },
      })
    }

    // Create JWT token
    const token = await createClientToken({
      clientId: String(client.id),
      email: client.email as string,
      name: client.name as string,
    })

    // Set cookie
    await setClientCookie(token)

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    )
  }
}
