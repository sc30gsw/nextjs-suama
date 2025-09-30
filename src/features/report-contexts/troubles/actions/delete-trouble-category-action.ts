'use server'

import type { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import { deleteInputSchema } from '~/types/schemas/delete-input-schema'

export async function deleteTroubleCategoryAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: deleteInputSchema,
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
    await db.delete(categoryOfTroubles).where(eq(categoryOfTroubles.id, submission.value.id))

    revalidateTag(GET_TROUBLE_CATEGORIES_CACHE_KEY)

    return {
      status: 'success',
    } as const satisfies SubmissionResult
  } catch (_) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }
}
