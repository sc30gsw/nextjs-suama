import * as z from 'zod/v4'

export const createTroubleCategoryInputSchema = z.object({
  name: z.string({ error: 'カテゴリー名を入力してください' }).max(128, {
    error: 'カテゴリー名は128文字以内で入力してください',
  }),
})

export type CreateTroubleCategoryInputSchema = z.infer<typeof createTroubleCategoryInputSchema>
