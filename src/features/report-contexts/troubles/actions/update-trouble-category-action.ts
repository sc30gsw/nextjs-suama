'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles } from '~/db/schema'
import { editTroubleCategoryInputSchema } from '~/features/report-contexts/troubles/types/schemas/edit-trouble-category-input-schema'
import { db } from '~/index'

export async function updateTroubleCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editTroubleCategoryInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
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

    revalidateTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
