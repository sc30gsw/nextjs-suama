'use server'

import { parseWithZod } from '@conform-to/zod/v4'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients } from '~/db/schema'
import { editClientInputSchema } from '~/features/report-contexts/clients/types/schemas/edit-client-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'
import { getServerSession } from '~/lib/get-server-session'

export async function updateClientAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editClientInputSchema,
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
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, submission.value.id),
    })

    if (!client) {
      return submission.reply({
        fieldErrors: { message: [ERROR_STATUS.NOT_FOUND] },
      })
    }

    await db
      .update(clients)
      .set({
        name: submission.value.name,
        likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
      })
      .where(eq(clients.id, submission.value.id))

    updateTag(GET_CLIENTS_CACHE_KEY)

    return submission.reply()
  } catch {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
