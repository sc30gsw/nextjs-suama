import * as z from 'zod/v4'
import { PASSWORD_REGEX } from '~/constants/validation'
import { allowedEmailSchema } from '~/types/schemas/allwoed-email-schema'

export const signInInputSchema = z.object({
  email: allowedEmailSchema.max(128, { error: 'メールアドレスが長すぎます(最大128文字)' }),
  password: z
    .string({ error: 'パスワードは必須です' })
    .min(8, { error: 'パスワードは8文字以上で入力してください' })
    .max(128, { error: 'パスワードが長すぎます（最大128文字）' })
    .regex(PASSWORD_REGEX, {
      error: 'パスワードには、英字・数字・記号を含めてください',
    }),
})

export type SignInInputSchema = z.infer<typeof signInInputSchema>
