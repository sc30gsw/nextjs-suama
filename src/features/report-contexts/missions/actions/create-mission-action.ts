'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { missions, projects } from '~/db/schema'
import { createMissionInputSchema } from '~/features/report-contexts/missions/types/schemas/create-mission-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'

export async function createMissionAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createMissionInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, submission.value.projectId),
    })

    if (!project) {
      return submission.reply({
        fieldErrors: { clientId: ['未登録のプロジェクトが選択されています。'] },
      })
    }

    await db.insert(missions).values({
      name: submission.value.name,
      likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
      projectId: submission.value.projectId,
    })

    revalidateTag(GET_MISSIONS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
