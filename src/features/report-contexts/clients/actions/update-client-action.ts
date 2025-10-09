'use server'

import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
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
      fieldErrors: { message: ['Something went wrong'] },
    })
  }
}
