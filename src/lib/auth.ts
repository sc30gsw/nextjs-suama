import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { passkey } from 'better-auth/plugins/passkey'
import { redirect } from 'next/navigation'

// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as schema from '~/db/schema'
import { db } from '~/index'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: ({ url }) => {
      // ! 本来はメール送信などをするが、今回はメールプロバイダーを使用しないためリダイレクトさせる
      redirect(url.replace('/api/auth', ''))
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
