import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (!user) return unauthorizedResponse()

    const body = await request.json()
    const { clientId, clientName, clientEmail, customMessage } = body

    if (!clientId || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'clientId, clientName e clientEmail sono obbligatori' },
        { status: 400 }
      )
    }

    const webhookRes = await fetch('http://vps-panel-n8n:5678/webhook/barber99-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'review_request',
        clientName,
        clientEmail,
        customMessage: customMessage || '',
        reviewUrl: process.env.GOOGLE_REVIEW_URL || 'https://search.google.com/local/writereview?placeid=ChIJh15YSTVFFRPRDzhAs0q0%2Fg%3D%3D',
      }),
    })

    if (!webhookRes.ok) {
      const text = await webhookRes.text().catch(() => 'Unknown error')
      console.error('N8N webhook error:', webhookRes.status, text)
      return NextResponse.json(
        { error: 'Errore nell\'invio della richiesta' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending review request:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
