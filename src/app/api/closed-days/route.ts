import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const sort = searchParams.get('sort') || 'date'

    const result = await payload.find({
      collection: 'closed-days',
      limit,
      sort,
    })

    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  } catch (error) {
    console.error('Error fetching closed days:', error)
    return NextResponse.json(
      { error: 'Failed to fetch closed days' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req)
    if (!user) return unauthorizedResponse()

    const payload = await getPayload({ config })
    const body = await req.json()

    // Convert YYYY-MM-DD from HTML date input to ISO string for Payload
    const dateValue = body.date.includes('T') ? body.date : `${body.date}T00:00:00.000Z`

    const doc = await payload.create({
      collection: 'closed-days',
      data: {
        date: dateValue,
        type: body.type,
        reason: body.reason,
        recurring: body.recurring ?? false,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error('Error creating closed day:', error)
    const message = error instanceof Error ? error.message : 'Failed to create closed day'
    return NextResponse.json(
      { errors: [{ message }] },
      { status: 400 },
    )
  }
}
