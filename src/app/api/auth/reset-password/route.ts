import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { jwtVerify } from 'jose'
import { hashPassword, isValidPassword } from '@/lib/auth'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

const secret = process.env.CLIENT_AUTH_SECRET || process.env.PAYLOAD_SECRET
const RESET_SECRET = new TextEncoder().encode(secret + '-reset')

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`reset:${ip}`, RATE_LIMITS.cancel)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token e password richiesti' }, { status: 400 })
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'La password deve avere almeno 8 caratteri, una lettera e un numero' },
        { status: 400 }
      )
    }

    // Verify reset token
    let tokenPayload
    try {
      const { payload: decoded } = await jwtVerify(token, RESET_SECRET)
      if (decoded.purpose !== 'password-reset') {
        return NextResponse.json({ error: 'Token non valido' }, { status: 400 })
      }
      tokenPayload = decoded
    } catch {
      return NextResponse.json({ error: 'Il link è scaduto o non valido. Richiedi un nuovo link.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const clientId = tokenPayload.clientId as string

    // Hash new password and update
    const hashedPassword = await hashPassword(password)

    await payload.update({
      collection: 'clients',
      id: Number(clientId),
      data: {
        password: hashedPassword,
        isRegistered: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo. Puoi ora accedere.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
