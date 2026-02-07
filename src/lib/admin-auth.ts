import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function requireAdmin(request: NextRequest) {
  const payload = await getPayload({ config })
  const cookies = request.headers.get('cookie') || ''
  const tokenMatch = cookies.match(/payload-token=([^;]+)/)
  if (!tokenMatch) return null
  const token = tokenMatch[1]
  try {
    const { user } = await payload.auth({ headers: new Headers({ Authorization: `JWT ${token}` }) })
    return user
  } catch {
    return null
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
