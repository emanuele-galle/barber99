import { NextRequest, NextResponse } from 'next/server'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: '/admin-panel/((?!login).*)',
}
