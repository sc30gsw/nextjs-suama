import * as z from 'zod/v4'

export const ALLOWED_DOMAIN = 'claves.co.jp'

export const allowedEmailSchema = z
  .email('有効なメールアドレスを入力してください')
  .refine((email) => email.endsWith(`@${ALLOWED_DOMAIN}`), {
    message: 'このメールアドレスは使用できません',
  })
