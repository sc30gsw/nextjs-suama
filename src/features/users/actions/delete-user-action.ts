'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { headers } from 'next/headers'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { users } from '~/db/schema'
import { db } from '~/index'
import { auth } from '~/lib/auth'
import { getServerSession } from '~/lib/get-server-session'
import {
  type CommonDeleteIdSchema,
  commonDeleteIdSchema,
} from '~/types/schemas/common-delete-id-schema'

export async function deleteUserAction(id: CommonDeleteIdSchema['id']) {
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

  try {
    const result = await auth.api.signOut({
      method: 'POST',
      headers: await headers(),
    })

    if (!result.success) {
      return {
        status: 'error',
        error: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
      } as const satisfies SubmissionResult
    }

    await db.delete(users).where(eq(users.id, parseResult.data.id))

    updateTag(GET_USERS_CACHE_KEY)

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
