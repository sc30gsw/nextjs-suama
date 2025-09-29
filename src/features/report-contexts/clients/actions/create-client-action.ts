'use server'

import { parseWithZod } from '@conform-to/zod'
import { revalidateTag } from 'next/cache'
import { GET_CLIENTS_CACHE_KEY } from '~/constants/cache-keys'
import { ERROR_STATUS } from '~/constants/error-message'
import { clients } from '~/db/schema'
import { createClientInputSchema } from '~/features/report-contexts/clients/types/schemas/create-client-input-schema'
import { sanitizeKeywords } from '~/features/report-contexts/utils/sanitaize-keywords'
import { db } from '~/index'

export async function createClientAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, {
    schema: createClientInputSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  try {
    await db.insert(clients).values({
      name: submission.value.name,
      likeKeywords: sanitizeKeywords(submission.value.likeKeywords),
    })

    revalidateTag(GET_CLIENTS_CACHE_KEY)

    return submission.reply()
  } catch (_) {
    return submission.reply({
      fieldErrors: { message: [ERROR_STATUS.SOMETHING_WENT_WRONG] },
    })
  }
}
