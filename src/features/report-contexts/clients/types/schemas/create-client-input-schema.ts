import { z } from 'zod/v4'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const createClientInputSchema = z.object({
  name: z.string({ error: 'クライアント名を入力してください' }).max(128, {
    error: 'クライアント名は128文字以内で入力してください',
  }),
  likeKeywords: z.string({ error: '検索単語を入力してください' }).refine(
    (value) => {
      if (value === undefined) {
        return true
      }

      const trimmed = value.trim()

      const isValid = LIKE_KEYWORDS_REGEX.test(trimmed)

      return isValid
    },
    {
      error: '検索単語はカンマ区切りで入力してください(例: apple,banana,orange)',
    },
  ),
})

export type CreateClientInputSchema = z.infer<typeof createClientInputSchema>
