'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles } from '~/db/schema'
import { editTroubleCategoryInputSchema } from '~/features/report-contexts/troubles/types/schemas/edit-trouble-category-input-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateTroubleCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editTroubleCategoryInputSchema,
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
    const category = await db.query.categoryOfTroubles.findFirst({
      where: eq(categoryOfTroubles.id, submission.value.id),
    })

    if (!category) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
      })
    }

    await db
      .update(categoryOfTroubles)
      .set({
        name: submission.value.name,
      })
      .where(eq(categoryOfTroubles.id, submission.value.id))

    updateTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
