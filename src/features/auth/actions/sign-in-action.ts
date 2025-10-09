'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { ERROR_STATUS } from '~/constants/error-message'
import { signInInputSchema } from '~/features/auth/types/schemas/sing-in-input-schema'
import { auth } from '~/lib/auth'

export async function signInAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: signInInputSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await auth.api.signInEmail({
      body: {
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
