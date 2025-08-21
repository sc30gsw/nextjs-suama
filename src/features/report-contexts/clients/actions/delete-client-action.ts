'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { clients } from '~/db/schema'
import { db } from '~/index'

export async function deleteClientAction(clientId: string) {
  try {
    await db.delete(clients).where(eq(clients.id, clientId))

    revalidateTag(GET_CLIENTS_CACHE_KEY)

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
