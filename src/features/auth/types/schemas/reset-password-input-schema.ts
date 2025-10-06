import { z } from 'zod/v4'

export const passwordResetInputSchema = z
  .object({
    password: z
      .string({ error: 'パスワードは必須です' })
      .min(8, { error: 'パスワードは8文字以上で入力してください' })
      .max(128, { error: 'パスワードが長すぎます（最大128文字）' })
      .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/, {
        error: 'パスワードには、英字・数字・記号を含めてください',
      }),
    token: z.string({
      error: 'トークンは必須です',
    }),
    confirmPassword: z
      .string({ error: '確認用パスワードは必須です' })
      .min(8, { error: '確認用パスワードは8文字以上で入力してください' })
      .max(128, { error: '確認用パスワードが長すぎます（最大128文字）' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type PasswordResetInputSchema = z.infer<typeof passwordResetInputSchema>
