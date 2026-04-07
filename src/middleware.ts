import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const userId = request.cookies.get('kog_user_id')?.value
  const isDemoMode = request.cookies.get('kog_demo')?.value === '1'

  if (!userId && !isDemoMode) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
