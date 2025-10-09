'use server'

import { parseWithZod } from '@conform-to/zod'
import { revalidateTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { categoryOfAppeals } from '~/db/schema'
import { createAppealCategoryInputSchema } from '~/features/report-contexts/appeals/types/schemas/create-appeal-category-input-schema'
import { db } from '~/index'

export async function createAppealCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createAppealCategoryInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await db.insert(categoryOfAppeals).values({
      name: submission.value.name,
    })

    revalidateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
