'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients, projects } from '~/db/schema'
import { editProjectInputSchema } from '~/features/report-contexts/projects/types/schemas/edit-project-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { getDb } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateProjectAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editProjectInputSchema,
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
    const db = getDb()
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, submission.value.clientId),
    })

    if (!client) {
      return submission.reply({
        fieldErrors: { clientId: [ERROR_STATUS.INVALID_CLIENT_RELATION] },
      })
    }

    await db
      .update(projects)
      .set({
        name: submission.value.name,
        likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
        clientId: submission.value.clientId,
        isArchived: submission.value.isArchived === 'on',
      })
      .where(eq(projects.id, submission.value.id))

    updateTag(GET_PROJECTS_CACHE_KEY)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
