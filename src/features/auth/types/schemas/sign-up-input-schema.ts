import * as z from 'zod/v4'
import { PASSWORD_REGEX } from '~/constants/validation'

export const signUpInputSchema = z
  .object({
    email: z
      .email('有効なメールアドレスを入力してください')
      .max(128, { error: 'メールアドレスが長すぎます(最大128文字)' }),
    password: z
      .string({ error: 'パスワードは必須です' })
      .min(8, { error: 'パスワードは8文字以上で入力してください' })
      .max(128, { error: 'パスワードが長すぎます(最大128文字)' })
      .regex(PASSWORD_REGEX, {
        error: 'パスワードには、英字・数字・記号を含めてください',
      }),
    confirmPassword: z
      .string({ error: '確認用パスワードは必須です' })
      .min(8, { error: '確認用パスワードは8文字以上で入力してください' })
      .max(128, { error: '確認用パスワードが長すぎます（最大128文字）' }),
    name: z
      .string({ error: '名前は必須です' })
      .max(128, { error: '名前が長すぎます（最大128文字）' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type SignUpInputSchema = z.infer<typeof signUpInputSchema>
