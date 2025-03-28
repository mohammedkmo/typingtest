import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/app') || 
    request.nextUrl.pathname.startsWith('/settings')
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Redirect unauthenticated users to sign in page from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const signInUrl = new URL('/auth/signin', request.url)
    // Store the original URL to redirect after sign in
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

// Apply middleware to specified routes
export const config = {
  matcher: [
    // Auth routes (sign in, register, etc.)
    '/auth/:path*',
    // Protected app routes
    '/app/:path*',
    // Protected settings routes
    '/settings/:path*'
  ]
}
