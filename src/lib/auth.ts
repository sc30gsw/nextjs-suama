import { passkey } from '@better-auth/passkey'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

import * as schema from '~/db/schema'
import { env } from '~/env'
import { db } from '~/index'
import { sendPasswordResetEmail, sendVerificationEmail } from '~/lib/resend'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
    usePlural: true,
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      const urlObj = new URL(url)

      const verificationUrl = new URL('/verify-email', env.NEXT_PUBLIC_APP_URL)
      verificationUrl.searchParams.set('token', token)

      await sendVerificationEmail(user.email, verificationUrl.toString())
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ url, user, token }) => {
      const urlObj = new URL(url)
      const callbackURL = urlObj.searchParams.get('callbackURL') ?? '/reset-password'

      const isChange = callbackURL.includes('/change-password')
      const type = isChange ? 'change' : 'reset'

      const resetUrl = new URL(callbackURL, env.NEXT_PUBLIC_APP_URL)
      resetUrl.searchParams.set('token', token)

      await sendPasswordResetEmail(user.email, resetUrl.toString(), type)
    },
  },
  // ? social connectionが必要な場合は、以下のように設定
  // socialProviders: {
  //   google: {
  //     clientId: env.GOOGLE_CLIENT_ID,
  //     clientSecret: env.GOOGLE_CLIENT_SECRET,
  //   },
  // },
  plugins: [nextCookies(), passkey()],
})
