import * as z from 'zod/v4'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const uploadProjectCsvRowSchema = z.object({
  id: z.string().optional(),
  name: z.string({ error: 'プロジェクト名を入力してください' }).max(128, {
    error: 'プロジェクト名は128文字以内で入力してください',
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
  clientId: z.string({ error: 'クライアントIDを入力してください' }),
  isArchived: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) {
        return false
      }

      if (typeof val === 'boolean') {
        return val
      }

      return val === 'true' || val === 'on' || val === '1'
    })
    .default(false),
})

export type UploadProjectCsvRowSchema = z.infer<typeof uploadProjectCsvRowSchema>
