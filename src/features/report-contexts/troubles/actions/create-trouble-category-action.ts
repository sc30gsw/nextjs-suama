'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { updateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles } from '~/db/schema'
import { createTroubleCategoryInputSchema } from '~/features/report-contexts/troubles/types/schemas/create-trouble-category-input-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function createTroubleCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createTroubleCategoryInputSchema,
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
    await db.insert(categoryOfTroubles).values({
      name: submission.value.name,
    })

    updateTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
