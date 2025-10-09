import { z } from 'zod/v4'

export const editTroubleCategoryInputSchema = z.object({
  id: z.string({ error: 'カテゴリーIDを入力してください' }),
  name: z.string({ error: 'カテゴリー名を入力してください' }).max(128, {
    error: 'カテゴリー名は128文字以内で入力してください',
  }),
})

export type EditTroubleCategoryInputSchema = z.infer<typeof editTroubleCategoryInputSchema>
