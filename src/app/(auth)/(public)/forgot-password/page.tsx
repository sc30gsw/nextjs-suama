import { IconArrowWallLeft } from '@intentui/icons'
import Link from 'next/link'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { ForgotPasswordForm } from '~/features/auth/components/forgot-password-form'
import { urls } from '~/lib/urls'

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      backToSignIn={
        <Link href={urls.href({ route: '/sign-in' })} className="w-full">
          <Button intent="outline" className="w-full">
            <IconArrowWallLeft />
            サインイン画面に戻る
          </Button>
        </Link>
      }
    >
      <Card.Header>
        <Card.Title>パスワードリセット</Card.Title>
        <Card.Description>
          メールアドレスを入力すると、パスワードリセット用メールを送信します
        </Card.Description>
      </Card.Header>
    </ForgotPasswordForm>
  )
}
