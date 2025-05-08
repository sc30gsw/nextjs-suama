import Link from 'next/link'
import { Card } from '~/components/ui/intent-ui/card'
import { SignUpForm } from '~/features/auth/components/sign-up-form'

export default function SignUpPage() {
  return (
    <SignUpForm
      haveAccountArea={
        <div className="flex items-center justify-between">
          アカウントをお持ちですか？
          <Link
            className="ml-2 text-blue-500 hover:text-blue-500/80"
            href="/sign-in"
          >
            サインイン
          </Link>
        </div>
      }
    >
      <Card.Header>
        <Card.Title>アカウント登録</Card.Title>
        <Card.Description>アカウントを作成してはじめましょう</Card.Description>
      </Card.Header>
    </SignUpForm>
  )
}
