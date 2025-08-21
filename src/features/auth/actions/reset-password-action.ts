'use server'

import { parseWithZod } from '@conform-to/zod'
import { passwordResetInputSchema } from '~/features/auth/types/schemas/reset-password-input-schema'
import { auth } from '~/lib/auth'

export async function resetPasswordAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: passwordResetInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await auth.api.resetPassword({
      body: {
        token: submission.value.token,
        newPassword: submission.value.password,
      },
    })

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
