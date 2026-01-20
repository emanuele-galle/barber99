import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body = await request.json()

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'noshow']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update appointment
    const updated = await payload.update({
      collection: 'appointments',
      id,
      data: body,
    })

    return NextResponse.json({
      success: true,
      appointment: updated,
    })
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    const appointment = await payload.findByID({
      collection: 'appointments',
      id,
      depth: 2,
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    await payload.delete({
      collection: 'appointments',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted',
    })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}
