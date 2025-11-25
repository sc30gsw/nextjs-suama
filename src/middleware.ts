import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'
import { urls } from '~/lib/urls'

export function middleware(request: NextRequest) {
  // ? https://www.better-auth.com/docs/integrations/next#middleware
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    return NextResponse.redirect(new URL(urls.href({ route: '/sign-in' }), request.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|api|trpc|sign-in|sign-up|forgot-password|reset-password|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
