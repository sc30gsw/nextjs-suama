import { Card } from '~/components/ui/intent-ui/card'
import { ResetPasswordForm } from '~/features/auth/components/reset-password-form'

export default async function ResetPasswordPage({
  params,
}: { params: Promise<Record<'token', string>> }) {
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
