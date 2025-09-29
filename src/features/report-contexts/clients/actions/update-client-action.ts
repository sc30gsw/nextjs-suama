'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients } from '~/db/schema'
import { editClientInputSchema } from '~/features/report-contexts/clients/types/schemas/edit-client-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'

export async function updateClientAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: editClientInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
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

    revalidateTag(GET_CLIENTS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
