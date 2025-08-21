import { Card } from '~/components/ui/intent-ui/card'
import { ResetPasswordForm } from '~/features/auth/components/reset-password-form'
import type { NextPageProps } from '~/types'

export default async function ResetPasswordPage({
  params,
}: NextPageProps<Record<'token', string>>) {
  const { token } = await params

  return (
    <ResetPasswordForm token={token}>
      <Card.Header>
        <Card.Title>パスワードリセット</Card.Title>
        <Card.Description>新しいパスワードを入力してください</Card.Description>
      </Card.Header>
    </ResetPasswordForm>
  )
}
