import { z } from 'zod'

export const passwordResetInputSchema = z
  .object({
    password: z
      .string({ required_error: 'パスワードは必須です' })
      .min(8, { message: 'パスワードは8文字以上で入力してください' })
      .max(128, { message: 'パスワードが長すぎます（最大128文字）' })
      .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/, {
        message: 'パスワードには、英字・数字・記号を含めてください',
      }),
    token: z.string({
      required_error: 'トークンは必須です',
    }),
    confirmPassword: z
      .string({ required_error: '確認用パスワードは必須です' })
      .min(8, { message: '確認用パスワードは8文字以上で入力してください' })
      .max(128, { message: '確認用パスワードが長すぎます（最大128文字）' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type PasswordResetInputSchema = z.infer<typeof passwordResetInputSchema>
