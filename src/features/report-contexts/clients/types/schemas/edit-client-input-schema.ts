import { z } from 'zod'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const editClientInputSchema = z.object({
  id: z.string({ required_error: 'クライアントIDを入力してください' }),
  name: z
    .string({ required_error: 'クライアント名を入力してください' })
    .max(128, {
      message: 'クライアント名は128文字以内で入力してください',
    }),
  likeKeywords: z
    .string({ required_error: '検索単語を入力してください' })
    .refine(
      (value) => {
        if (value === undefined) {
          return true
        }

        const trimmed = value.trim()

        // カンマ区切りのみを許容する
        const isValid = LIKE_KEYWORDS_REGEX.test(trimmed)

        return isValid
      },
      {
        message:
          '検索単語はカンマ区切りで入力してください（例: apple,banana,orange）',
      },
    ),
})

export type EditClientInputSchema = z.infer<typeof editClientInputSchema>
