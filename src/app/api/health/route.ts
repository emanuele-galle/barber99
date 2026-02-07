import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}
  let healthy = true

  try {
    const payload = await getPayload({ config })
    await payload.find({ collection: 'services', limit: 1 })
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
    healthy = false
  }

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  )
}
