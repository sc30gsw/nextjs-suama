import Link from 'next/link'
import { Card } from '~/components/ui/intent-ui/card'
import { SignInForm } from '~/features/auth/components/sign-in-form'
import { urls } from '~/lib/urls'

export default function SignInPage() {
  return (
    <SignInForm
      notHaveAccountArea={
        <div className="mt-2 flex items-center gap-x-2">
          アカウントをお持ちでないですか？
          <Link
            className="text-blue-500 hover:text-blue-500/80"
            href={urls.href({ route: '/sign-up' })}
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
