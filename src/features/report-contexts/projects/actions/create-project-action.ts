'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_PROJECTS_CACHE_KEY } from '~/constants/cache-keys'
import { clients, projects } from '~/db/schema'
import { createProjectInputSchema } from '~/features/report-contexts/projects/types/schemas/create-project-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'

export async function createProjectAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createProjectInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, submission.value.clientId),
    })

    if (!client) {
      return submission.reply({
        fieldErrors: { clientId: ['未登録のクライアントが選択されています。'] },
      })
    }

    await db.insert(projects).values({
      name: submission.value.name,
      likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
      clientId: submission.value.clientId,
      isArchived: submission.value.isArchive === 'on',
    })

    revalidateTag(GET_PROJECTS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
