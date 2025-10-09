'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { or } from 'drizzle-orm'
import { ERROR_STATUS } from '~/constants/error-message'
import { signUpInputSchema } from '~/features/auth/types/schemas/sign-up-input-schema'
import { db } from '~/index'
import { auth } from '~/lib/auth'

export async function signUpAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: signUpInputSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) =>
        or(eq(users.email, submission.value.email), eq(users.name, submission.value.name)),
    })

    if (existingUser) {
      return submission.reply({
        fieldErrors: {
          message: [ERROR_STATUS.ALREADY_EXISTS],
        },
      })
    }

    await auth.api.signUpEmail({
      body: {
        name: submission.value.name,
        email: submission.value.email,
        password: submission.value.password,
      },
    })

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
