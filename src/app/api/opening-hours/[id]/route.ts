import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.isClosed !== undefined) data.isClosed = body.isClosed
    if (body.openTime !== undefined) data.openTime = body.openTime
    if (body.closeTime !== undefined) data.closeTime = body.closeTime
    if (body.breakStart !== undefined) data.breakStart = body.breakStart
    if (body.breakEnd !== undefined) data.breakEnd = body.breakEnd

    const doc = await payload.update({
      collection: 'opening-hours',
      id,
      data,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error updating opening hours:', error)
    return NextResponse.json({ error: 'Failed to update opening hours' }, { status: 500 })
  }
}
