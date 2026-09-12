import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Make the AI Studio the home of the CMS: landing on the bare /admin dashboard
// bounces to /studio. Deeper /admin/* routes (collections, globals) still work.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/studio', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin'] }
