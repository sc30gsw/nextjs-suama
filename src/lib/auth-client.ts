import { passkeyClient } from '@better-auth/passkey/client'
import { customSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from '~/env'
import type { auth } from '~/lib/auth'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [passkeyClient(), customSessionClient<typeof auth>()],
})
