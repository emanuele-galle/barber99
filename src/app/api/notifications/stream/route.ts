import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bookingEvents } from '@/lib/booking-events'

// Check admin auth from cookies
async function getAdminUser(request: NextRequest) {
  const cookies = request.headers.get('cookie') || ''
  const tokenMatch = cookies.match(/payload-token=([^;]+)/)
  if (!tokenMatch) return null
  const token = tokenMatch[1]
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  // Auth check
  const user = await getAdminUser(request)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Generic event handler
      type BookingEventData = {
        appointmentId: string
        clientName: string
        serviceName: string
        date: string
        time: string
      }

      const sendEvent = (type: string) => (data: BookingEventData) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
          )
        } catch {
          cleanup()
        }
      }

      const onNewBooking = sendEvent('new_booking')
      const onCancellation = sendEvent('cancellation')
      const onModification = sendEvent('modification')

      bookingEvents.on('new_booking', onNewBooking)
      bookingEvents.on('cancellation', onCancellation)
      bookingEvents.on('modification', onModification)

      // Cleanup on disconnect
      const cleanup = () => {
        clearInterval(heartbeat)
        bookingEvents.off('new_booking', onNewBooking)
        bookingEvents.off('cancellation', onCancellation)
        bookingEvents.off('modification', onModification)
      }

      // Handle client disconnect via AbortSignal
      request.signal.addEventListener('abort', cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
