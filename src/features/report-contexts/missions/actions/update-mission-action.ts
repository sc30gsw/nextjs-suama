'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_MISSIONS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { missions, projects } from '~/db/schema'
import { editMissionInputSchema } from '~/features/report-contexts/missions/types/schemas/edit-mission-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateMissionAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editMissionInputSchema,
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
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, submission.value.projectId),
    })

    if (!project) {
      return submission.reply({
        fieldErrors: { clientId: [ERROR_STATUS.INVALID_PROJECT_RELATION] },
      })
    }

    await db
      .update(missions)
      .set({
        name: submission.value.name,
        likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
        projectId: submission.value.projectId,
      })
      .where(eq(missions.id, submission.value.id))

    revalidateTag(GET_MISSIONS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
