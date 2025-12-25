import * as z from 'zod/v4'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const uploadMissionCsvRowSchema = z.object({
  id: z.string().optional(),
  name: z.string({ error: 'ミッション名を入力してください' }).max(128, {
    error: 'ミッション名は128文字以内で入力してください',
  }),
  likeKeywords: z
    .string()
    .optional()
    .default('')
    .refine(
      (value) => {
        if (!value || value.trim() === '') {
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
  projectId: z.string({ error: 'プロジェクトIDを入力してください' }),
})

export type UploadMissionCsvRowSchema = z.infer<typeof uploadMissionCsvRowSchema>
