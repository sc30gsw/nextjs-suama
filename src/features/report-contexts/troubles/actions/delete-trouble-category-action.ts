'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_TROUBLE_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { categoryOfTroubles } from '~/db/schema'
import { db } from '~/index'

export async function deleteTroubleCategoryAction(categoryId: string) {
  try {
    await db.delete(categoryOfTroubles).where(eq(categoryOfTroubles.id, categoryId))

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
