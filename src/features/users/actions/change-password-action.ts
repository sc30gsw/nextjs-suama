'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { ERROR_STATUS } from '~/constants/error-message'
import { accounts, users } from '~/db/schema'
import { changePasswordInputSchema } from '~/features/users/types/schemas/change-password-input-schema'
import { db } from '~/index'
import { auth } from '~/lib/auth'
import { getServerSession } from '~/lib/get-server-session'

export async function changePasswordAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: changePasswordInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const session = await getServerSession()

  if (!session) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.UNAUTHORIZED] },
    })
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, submission.value.id),
    })

    if (!user) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
      })
    }

    const ctx = await auth.$context
    const hash = await ctx.password.hash(submission.value.password)
    await db
      .update(accounts)
      .set({
        password: hash,
      })
      .where(eq(accounts.userId, user.id))

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
