import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware is disabled for static export
// This file is kept for compatibility but the middleware function is empty
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}