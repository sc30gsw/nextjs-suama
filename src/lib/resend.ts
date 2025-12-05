import { Resend } from 'resend'
import { PasswordResetEmail } from '~/components/ui/email/password-reset-email'
import { UserUpdateEmail } from '~/components/ui/email/user-update-email'
import type { users } from '~/db/schema'
import { env } from '~/env'

export const resend = new Resend(env.RESEND_API_KEY)

export const sendPasswordResetEmail = async (
  email: (typeof users.$inferSelect)['email'],
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
    return
  }

  return data
}

export const sendUserUpdateEmail = async (
  email: (typeof users.$inferSelect)['email'],
  name: (typeof users.$inferSelect)['name'],
  oldEmail?: (typeof users.$inferSelect)['email'],
  newEmail?: (typeof users.$inferSelect)['email'],
) => {
  const isEmailChanged = oldEmail !== undefined && newEmail !== undefined && oldEmail !== newEmail
  const subject = isEmailChanged ? 'メールアドレス変更通知' : 'ユーザー情報更新通知'

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: env.RESEND_TEST_EMAIL ?? email,
    subject,
    react: UserUpdateEmail({ email, name, oldEmail, newEmail }),
  })

  if (error) {
    return
  }

  return data
}
