import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request)
    const { allowed } = rateLimit(`contact:${ip}`, RATE_LIMITS.contact)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Troppi tentativi. Riprova tra qualche minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome richiesto (minimo 2 caratteri)' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Nome troppo lungo' },
        { status: 400 }
      )
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Messaggio richiesto (minimo 10 caratteri)' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Messaggio troppo lungo (max 2000 caratteri)' },
        { status: 400 }
      )
    }

    if (phone && typeof phone === 'string' && phone.length > 20) {
      return NextResponse.json(
        { error: 'Telefono non valido' },
        { status: 400 }
      )
    }

    // Valid subjects
    const validSubjects = ['info', 'booking', 'collaboration', 'complaint', 'other']
    const validSubject = validSubjects.includes(subject) ? subject : 'info'

    // Create contact submission in Payload
    const payload = await getPayload({ config })

    const submission = await payload.create({
      collection: 'contact-submissions',
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || undefined,
        subject: validSubject,
        message: message.trim(),
        status: 'new',
      },
    })

    // Optionally trigger N8N webhook for notification
    const n8nWebhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contact_submission',
            data: {
              id: submission.id,
              name: submission.name,
              email: submission.email,
              phone: submission.phone,
              subject: submission.subject,
              message: submission.message,
              createdAt: submission.createdAt,
            },
          }),
        })
      } catch (webhookError) {
        // Don't fail the request if webhook fails
        console.error('N8N webhook error:', webhookError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Messaggio inviato con successo',
      id: submission.id,
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Errore durante invio messaggio' },
      { status: 500 }
    )
  }
}
