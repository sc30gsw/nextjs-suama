'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'
import {
  type CommonDeleteIdSchema,
  commonDeleteIdSchema,
} from '~/types/schemas/common-delete-id-schema'

export async function retireUserAction(id: CommonDeleteIdSchema['id']) {
  const parseResult = commonDeleteIdSchema.safeParse({ id })

  if (!parseResult.success) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }

  const session = await getServerSession()

  if (!session) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.UNAUTHORIZED] },
    } as const satisfies SubmissionResult
  }

  if (session.user.role !== 'admin') {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.FOR_BIDDEN] },
    } as const satisfies SubmissionResult
  }

  try {
    await db
      .update(users)
      .set({
        isRetired: true,
        role: 'user',
      })
      .where(eq(users.id, parseResult.data.id))

    updateTag(GET_USERS_CACHE_KEY)

    const isSelf = session.user.id === parseResult.data.id

    return {
      status: 'success',
      fields: [isSelf ? 'isSelf' : ''],
    } as const satisfies SubmissionResult
  } catch (_) {
    return {
      status: 'error',
      error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    } as const satisfies SubmissionResult
  }
}
