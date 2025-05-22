import { z } from 'zod'

export const editUserInputSchema = z.object({
  id: z.string({ required_error: 'ユーザーIDを入力してください' }),
  name: z.string({ required_error: 'ユーザー名を入力してください' }).max(128, {
    message: 'ユーザー名は128文字以内で入力してください',
  }),
  image: z
    .string()
    .max(7_000_000, {
      message: '画像のサイズが大きすぎます（最大約5MB）',
    })
    .regex(/^data:image\/(jpeg|png|webp);base64,/, {
      message: '画像はjpeg・png・webpのみ選択可能です',
    })
    .optional(),
})

export type EditUserInputSchema = z.infer<typeof editUserInputSchema>
