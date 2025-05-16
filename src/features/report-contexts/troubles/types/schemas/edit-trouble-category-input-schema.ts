import { z } from 'zod'

export const editTroubleCategoryInputSchema = z.object({
  id: z.string({ required_error: 'カテゴリーIDを入力してください' }),
  name: z
    .string({ required_error: 'カテゴリー名を入力してください' })
    .max(128, {
      message: 'カテゴリー名は128文字以内で入力してください',
    }),
})

export type EditTroubleCategoryInputSchema = z.infer<
  typeof editTroubleCategoryInputSchema
>
