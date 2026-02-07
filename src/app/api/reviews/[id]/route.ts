import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    if (!user) return unauthorizedResponse()

    const payload = await getPayload({ config })
    const { id } = await params
    const body = await request.json()

    const updated = await payload.update({
      collection: 'reviews',
      id,
      data: body,
    })

    return NextResponse.json({
      success: true,
      doc: updated,
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    if (!user) return unauthorizedResponse()

    const payload = await getPayload({ config })
    const { id } = await params

    await payload.delete({
      collection: 'reviews',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
