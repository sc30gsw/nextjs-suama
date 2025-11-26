'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { ERROR_STATUS } from '~/constants/error-message'
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
        message: [ERROR_STATUS.EMAIL_NOT_FOUND],
      },
    })
  }

  await auth.api.requestPasswordReset({
    body: {
      email: submission.value.email,
      redirectTo: '/reset-password',
    },
  })

  return submission.reply()
}
