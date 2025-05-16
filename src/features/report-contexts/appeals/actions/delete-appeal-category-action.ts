'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_APPEAL_CATEGORIES_CACHE_KEY } from '~/constants/cache-keys'
import { categoriesOfAppeal } from '~/db/schema'
import { db } from '~/index'

export async function deleteAppealCategoryAction(categoryId: string) {
  try {
    await db
      .delete(categoriesOfAppeal)
      .where(eq(categoriesOfAppeal.id, categoryId))

    revalidateTag(GET_APPEAL_CATEGORIES_CACHE_KEY)

    return {
      status: 'success',
    } as const satisfies SubmissionResult
  } catch (_) {
    return {
      status: 'error',
      error: { message: ['Something went wrong'] },
    } as const satisfies SubmissionResult
  }
}
