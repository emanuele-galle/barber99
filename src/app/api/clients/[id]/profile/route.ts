import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getClientFromCookie } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tokenPayload = await getClientFromCookie()

    // Verify that the requesting client matches the requested ID
    if (!tokenPayload || tokenPayload.clientId !== id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, phone, preferences } = body

    const payload = await getPayload({ config })

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (phone !== undefined) {
      updateData.phone = phone
    }

    if (preferences !== undefined) {
      updateData.preferences = {
        preferredBarber: preferences.preferredBarber || null,
        hairNotes: preferences.hairNotes || '',
        preferredServices: preferences.preferredServices || [],
      }
    }

    // Update client
    const updatedClient = await payload.update({
      collection: 'clients',
      id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        preferences: updatedClient.preferences,
      },
    })
  } catch (error) {
    console.error('Error updating client profile:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento del profilo' },
      { status: 500 }
    )
  }
}
