import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://barber99.it',
  'https://www.barber99.it',
  'https://barber99.fodivps2.cloud',
]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const response = NextResponse.next()

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      })
    }

    return response
  }

  // Admin panel protection (except login page)
  if (pathname.startsWith('/admin-panel') && !pathname.startsWith('/admin-panel/login')) {
    const token = request.cookies.get('payload-token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin-panel/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-panel/((?!login).*)', '/api/:path*'],
}
