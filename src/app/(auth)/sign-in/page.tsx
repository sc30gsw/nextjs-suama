import Link from 'next/link'
import { Card } from '~/components/ui/intent-ui/card'
import { SignInForm } from '~/features/auth/components/sign-in-form'

export default function SignInPage() {
  return (
    <SignInForm
      notHaveAccountArea={
        <div className="flex items-center justify-between">
          アカウントをお持ちでないですか？
          <Link
            className="ml-2 text-blue-500 hover:text-blue-500/80"
            href="/sign-up"
          >
            サインアップ
          </Link>
        </div>
      }
    >
      <Card.Header>
        <Card.Title>サインイン</Card.Title>
        <Card.Description>アカウントにサインイン</Card.Description>
      </Card.Header>
    </SignInForm>
  )
}
