'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { users } from '~/db/schema'
import { settingUserInputSchema } from '~/features/users/types/schemas/setting-user-input-schema'
import { db } from '~/index'

export async function settingUserAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: settingUserInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, submission.value.id),
    })

    if (!user) {
      return submission.reply({
        fieldErrors: { message: ['ユーザーが見つかりませんでした'] },
      })
    }

    if (user.email !== submission.value.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, submission.value.email),
      })

      if (existingUser) {
        return submission.reply({
          fieldErrors: {
            message: ['入力されたメールアドレスは既に使用されています。'],
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

      revalidateTag(GET_USERS_CACHE_KEY)

      return submission.reply()
    }

    await db
      .update(users)
      .set({
        name: submission.value.name,
        image: submission.value.image ?? null,
      })
      .where(eq(users.id, submission.value.id))

    revalidateTag(GET_USERS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
