'use server'

import type { SubmissionResult } from '@conform-to/react'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { projects } from '~/db/schema'
import { db } from '~/index'

export async function deleteProjectAction(projectId: string) {
  try {
    await db.delete(projects).where(eq(projects.id, projectId))

    revalidateTag(GET_PROJECTS_CACHE_KEY)

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
