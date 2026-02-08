import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SignJWT } from 'jose'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

const secret = process.env.CLIENT_AUTH_SECRET || process.env.PAYLOAD_SECRET
const RESET_SECRET = new TextEncoder().encode(secret + '-reset')
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://vps-panel-n8n:5678/webhook/barber99-booking'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`forgot:${ip}`, RATE_LIMITS.cancel)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: 'Se l\'email è associata a un account, riceverai un link per reimpostare la password.',
    })

    const payload = await getPayload({ config })

    const clients = await payload.find({
      collection: 'clients',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
    })

    if (clients.docs.length === 0) {
      return successResponse
    }

    const client = clients.docs[0]

    // Generate reset token (JWT, 1 hour expiry)
    const resetToken = await new SignJWT({
      clientId: String(client.id),
      email: client.email,
      purpose: 'password-reset',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(RESET_SECRET)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barber99.fodivps2.cloud'
    const resetLink = `${baseUrl}/account/reset-password?token=${resetToken}`

    // Send reset email via N8N
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'password_reset',
          client_name: client.name,
          client_email: client.email,
          resetLink,
        }),
      })
    } catch (e) {
      console.error('Failed to send reset email:', e)
    }

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
