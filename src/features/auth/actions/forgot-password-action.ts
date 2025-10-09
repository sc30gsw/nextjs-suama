'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { users } from '~/db/schema'
import { signInInputSchema } from '~/features/auth/types/schemas/sing-in-input-schema'
import { db } from '~/index'
import { auth } from '~/lib/auth'

export async function forgotPasswordAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: signInInputSchema.pick({ email: true }),
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, submission.value.email),
  })

  if (!existingUser) {
    return submission.reply({
      fieldErrors: {
        message: ['そのメールアドレスは登録されていません'],
      },
    })
  }

  await auth.api.forgetPassword({
    body: {
      email: submission.value.email,
      redirectTo: '/reset-password',
    },
  })

  return submission.reply()
}
