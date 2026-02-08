import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin(req)
    if (!user) return unauthorizedResponse()

    const { id } = await params
    const payload = await getPayload({ config })

    await payload.delete({
      collection: 'closed-days',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting closed day:', error)
    return NextResponse.json(
      { error: 'Failed to delete closed day' },
      { status: 500 },
    )
  }
}
