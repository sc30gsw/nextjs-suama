import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'

export async function proxy(request: NextRequest) {
  // ? https://www.better-auth.com/docs/integrations/next#middleware
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (!session.user.emailVerified) {
    const verifyEmailUrl = new URL('/verify-email', request.url)
    verifyEmailUrl.searchParams.set('from', 'proxy')
    
    return NextResponse.redirect(verifyEmailUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|api|trpc|sign-in|sign-up|forgot-password|reset-password|verify-email|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
