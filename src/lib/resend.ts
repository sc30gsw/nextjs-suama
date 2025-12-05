import { Resend } from 'resend'
import { PasswordResetEmail } from '~/components/ui/email/password-reset-email'
import { env } from '~/env'

export const resend = new Resend(env.RESEND_API_KEY)

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  type: 'reset' | 'change' = 'reset',
) => {
  const subject = type === 'change' ? 'パスワード変更' : 'パスワードリセット'

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: env.RESEND_TEST_EMAIL ?? email,
    subject,
    react: PasswordResetEmail({ email, resetUrl, type }),
  })

  if (error) {
    console.log('🚀 ~ sendPasswordResetEmail ~ error:', error)
    return
  }

  return data
}
