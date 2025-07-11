'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { categoriesOfAppeal } from '~/db/schema'
import { editAppealCategoryInputSchema } from '~/features/report-contexts/appeals/types/schemas/edit-appeal-category-input-schema'
import { db } from '~/index'

export async function updateAppealCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editAppealCategoryInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await db
      .update(categoriesOfAppeal)
      .set({
        name: submission.value.name,
      })
      .where(eq(categoriesOfAppeal.id, submission.value.id))

    revalidateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
