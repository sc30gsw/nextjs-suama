'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { APIError } from 'better-auth/api'
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
  } catch (error) {
    // ? APIErrorの判定とならないため、構造で判定する
    // ? auth.api.signInEmailを呼び出すことで、sendOnSignInがtrueの場合、自動的にメール認証メールが送信される
    const isForbiddenError =
      (error instanceof APIError &&
        (error.status === 403 || error.statusCode === 403 || error.status === 'FORBIDDEN')) ||
      (error &&
        typeof error === 'object' &&
        'status' in error &&
        ((error as { status: unknown }).status === 403 ||
          (error as { status: unknown }).status === 'FORBIDDEN')) ||
      (error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        (error as { statusCode: unknown }).statusCode === 403)

    if (isForbiddenError) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.FOR_BIDDEN] },
      })
    }

    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
