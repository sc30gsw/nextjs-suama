'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import { settingUserInputSchema } from '~/features/users/types/schemas/setting-user-input-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function settingUserAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: settingUserInputSchema,
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

    if (user.email !== submission.value.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, submission.value.email),
      })

      if (existingUser) {
        return submission.reply({
          fieldErrors: {
            message: [ERROR_STATUS.ALREADY_EXISTS],
          },
        })
      }

      await db
        .update(users)
        .set({
          name: submission.value.name,
          email: submission.value.email,
          image: submission.value.image ?? null,
        })
        .where(eq(users.id, submission.value.id))

      updateTag(GET_USERS_CACHE_KEY)

      return submission.reply()
    }

    await db
      .update(users)
      .set({
        name: submission.value.name,
        image: submission.value.image ?? null,
      })
      .where(eq(users.id, submission.value.id))

    updateTag(GET_USERS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
