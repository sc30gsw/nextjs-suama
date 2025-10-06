import { z } from 'zod/v4'

export const signInInputSchema = z.object({
  email: z
    .email('有効なメールアドレスを入力してください')
    .max(128, { error: 'メールアドレスが長すぎます(最大128文字)' }),
  password: z
    .string({ error: 'パスワードは必須です' })
    .min(8, { error: 'パスワードは8文字以上で入力してください' })
    .max(128, { error: 'パスワードが長すぎます（最大128文字）' })
    .regex(
      /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/,
      'パスワードには、英字・数字・記号を含めてください',
    ),
})

export type SignInInputSchema = z.infer<typeof signInInputSchema>
