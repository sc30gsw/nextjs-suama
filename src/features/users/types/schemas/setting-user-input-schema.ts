import { z } from 'zod'

export const settingUserInputSchema = z.object({
  id: z.string({ required_error: 'ユーザーIDを入力してください' }),
  name: z.string({ required_error: 'ユーザー名を入力してください' }).max(128, {
    message: 'ユーザー名は128文字以内で入力してください',
  }),
  email: z
    .string({ required_error: 'メールアドレスを入力してください' })
    .email({ message: 'メールアドレスの形式が正しくありません' })
    .max(128, {
      message: 'メールアドレスは128文字以内で入力してください',
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

export type SettingUserInputSchema = z.infer<typeof settingUserInputSchema>
