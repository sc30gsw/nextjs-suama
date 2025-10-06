import { z } from 'zod/v4'

export const settingUserInputSchema = z.object({
  id: z.string({ error: 'ユーザーIDを入力してください' }),
  name: z.string({ error: 'ユーザー名を入力してください' }).max(128, {
    error: 'ユーザー名は128文字以内で入力してください',
  }),
  email: z.email('メールアドレスの形式が正しくありません').max(128, {
    error: 'メールアドレスは128文字以内で入力してください',
  }),
  image: z
    .string()
    .max(7_000_000, {
      error: '画像のサイズが大きすぎます（最大約5MB）',
    })
    .regex(/^data:image\/(jpeg|png|webp);base64,/, {
      error: '画像はjpeg・png・webpのみ選択可能です',
    })
    .optional(),
})

export type SettingUserInputSchema = z.infer<typeof settingUserInputSchema>
