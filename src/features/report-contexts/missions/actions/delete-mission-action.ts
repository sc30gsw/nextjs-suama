'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { missions } from '~/db/schema'
import { db } from '~/index'

export async function deleteMissionAction(missionId: string) {
  try {
    await db.delete(missions).where(eq(missions.id, missionId))

    revalidateTag(GET_MISSIONS_CACHE_KEY)

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
