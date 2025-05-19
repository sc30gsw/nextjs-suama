import { z } from 'zod'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const createMissionInputSchema = z.object({
  name: z
    .string({ required_error: 'ミッション名を入力してください' })
    .max(128, {
      message: 'ミッション名は128文字以内で入力してください',
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
  projectId: z.string({ required_error: 'プロジェクトを選択してください' }),
})

export type CreateMissionInputSchema = z.infer<typeof createMissionInputSchema>
