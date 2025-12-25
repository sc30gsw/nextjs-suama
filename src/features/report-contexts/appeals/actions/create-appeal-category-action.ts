'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { updateTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfAppeals } from '~/db/schema'
import { createAppealCategoryInputSchema } from '~/features/report-contexts/appeals/types/schemas/create-appeal-category-input-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function createAppealCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createAppealCategoryInputSchema,
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
    await db.insert(categoryOfAppeals).values({
      name: submission.value.name,
    })

    updateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
