import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const { name, phone, email, preferences, notes, tags } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    const doc = await payload.create({
      collection: 'clients',
      data: {
        name,
        phone,
        email: email || undefined,
        preferences: preferences || undefined,
        notes: notes || undefined,
        tags: tags || undefined,
        totalVisits: 0,
        noShowCount: 0,
        totalSpent: 0,
      },
    })

    return NextResponse.json({ doc })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag') || ''
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.or = [
        { name: { like: search } },
        { phone: { like: search } },
        { email: { like: search } },
      ]
    }

    if (tag) {
      where.tags = { contains: tag }
    }

    const docs = await payload.find({
      collection: 'clients',
      where,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}
