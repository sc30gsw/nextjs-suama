'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfAppeals } from '~/db/schema'
import { editAppealCategoryInputSchema } from '~/features/report-contexts/appeals/types/schemas/edit-appeal-category-input-schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateAppealCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editAppealCategoryInputSchema,
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
    const category = await db.query.categoryOfAppeals.findFirst({
      where: eq(categoryOfAppeals.id, submission.value.id),
    })

    if (!category) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
      })
    }

    await db
      .update(categoryOfAppeals)
      .set({
        name: submission.value.name,
      })
      .where(eq(categoryOfAppeals.id, submission.value.id))

    updateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
