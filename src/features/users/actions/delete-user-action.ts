'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { GET_USERS_CACHE_KEY } from '~/constants/cache-keys'
import { users } from '~/db/schema'
import { db } from '~/index'
import { auth } from '~/lib/auth'

export async function deleteUserAction(userId: string) {
  try {
    const result = await auth.api.signOut({
      method: 'POST',
      headers: await headers(),
    })

    if (!result.success) {
      return {
        status: 'error',
        error: { message: ['Sign-out failed'] },
      } as const satisfies SubmissionResult
    }

    await db.delete(users).where(eq(users.id, userId))

    revalidateTag(GET_USERS_CACHE_KEY)

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
