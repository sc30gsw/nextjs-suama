import { z } from 'zod'

export const createTroubleCategoryInputSchema = z.object({
  name: z.string({ required_error: 'カテゴリー名を入力してください' }).max(128, {
    message: 'カテゴリー名は128文字以内で入力してください',
  }),
})

export type CreateTroubleCategoryInputSchema = z.infer<typeof createTroubleCategoryInputSchema>
