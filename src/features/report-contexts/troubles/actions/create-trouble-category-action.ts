'use server'

import { parseWithZod } from '@conform-to/zod'
import { revalidateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { categoriesOfTrouble } from '~/db/schema'
import { createTroubleCategoryInputSchema } from '~/features/report-contexts/troubles/types/schemas/create-trouble-category-input-schema'
import { db } from '~/index'

export async function createTroubleCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createTroubleCategoryInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await db.insert(categoriesOfTrouble).values({
      name: submission.value.name,
    })

    revalidateTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
