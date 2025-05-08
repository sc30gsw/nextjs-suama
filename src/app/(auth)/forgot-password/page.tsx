import { Card } from '~/components/ui/intent-ui/card'
import { ForgotPasswordForm } from '~/features/auth/components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm>
      <Card.Header>
        <Card.Title>パスワードリセット</Card.Title>
        <Card.Description>
          メールアドレスを入力すると、パスワードリセット画面に遷移します
        </Card.Description>
      </Card.Header>
    </ForgotPasswordForm>
  )
}
