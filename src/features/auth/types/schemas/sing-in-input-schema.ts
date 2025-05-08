import { z } from 'zod'

export const signInInputSchema = z.object({
  email: z
    .string({ required_error: 'メールアドレスは必須です' })
    .email({ message: '有効なメールアドレスを入力してください' })
    .max(128, { message: 'メールアドレスが長すぎます（最大128文字）' }),
  password: z
    .string({ required_error: 'パスワードは必須です' })
    .min(8, { message: 'パスワードは8文字以上で入力してください' })
    .max(128, { message: 'パスワードが長すぎます（最大128文字）' })
    .regex(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/, {
      message: 'パスワードには、英字・数字・記号を含めてください',
    }),
})

export type SignInInputSchema = z.infer<typeof signInInputSchema>
