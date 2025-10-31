import * as z from 'zod/v4'
import { LIKE_KEYWORDS_REGEX } from '~/constants'

export const editMissionInputSchema = z.object({
  id: z.string({ error: 'ミッションIDを入力してください' }),
  name: z.string({ error: 'ミッション名を入力してください' }).max(128, {
    error: 'ミッション名は128文字以内で入力してください',
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
  projectId: z.string({ error: 'プロジェクトを選択してください' }),
})

export type EditMissionInputSchema = z.infer<typeof editMissionInputSchema>
