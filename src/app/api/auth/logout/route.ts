import { NextResponse } from 'next/server'
import { clearClientCookie } from '@/lib/auth'

export async function POST() {
  try {
    await clearClientCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Errore durante il logout' },
      { status: 500 }
    )
  }
}
