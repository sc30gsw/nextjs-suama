import { z } from 'zod'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const editProjectInputSchema = z.object({
  id: z.string({ required_error: 'プロジェクトIDを入力してください' }),
  name: z
    .string({ required_error: 'プロジェクト名を入力してください' })
    .max(128, {
      message: 'プロジェクト名は128文字以内で入力してください',
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
  clientId: z.string({ required_error: 'クライアントを選択してください' }),
  isArchive: z.enum(['on', 'off']).optional().default('off'),
})

export type EditProjectInputSchema = z.infer<typeof editProjectInputSchema>
