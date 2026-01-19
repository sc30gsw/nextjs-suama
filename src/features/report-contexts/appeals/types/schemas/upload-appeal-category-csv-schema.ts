import * as z from 'zod/v4'

export const uploadAppealCategoryCsvRowSchema = z.object({
  id: z.string().optional(),
  name: z.string({ error: 'カテゴリー名を入力してください' }).max(128, {
    error: 'カテゴリー名は128文字以内で入力してください',
  }),
})

export type UploadAppealCategoryCsvRowSchema = z.infer<typeof uploadAppealCategoryCsvRowSchema>
