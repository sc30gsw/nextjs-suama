import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { GlowCard } from '~/components/ui/glow-card'
import { Card } from '~/components/ui/intent-ui/card'
import { ResendVerificationEmailForm } from '~/features/auth/components/resend-verification-email-form'
import { verifyEmailAction } from '~/features/auth/actions/verify-email-action'
import { authSearchParamsCache } from '~/features/auth/types/search-params/auth-search-params-cache'
import { auth } from '~/lib/auth'
import { urls } from '~/lib/urls'
import type { NextPageProps } from '~/types'

export default async function VerifyEmailPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const { token } = await authSearchParamsCache.parse(searchParams)

  if (token) {
    const result = await verifyEmailAction(token)

    if (result.success) {
      redirect(urls.href({ route: '/' }))
    }

    return (
      <GlowCard className="mx-auto w-full max-w-md">
        <Card.Header>
          <Card.Title>メール認証エラー</Card.Title>
          <Card.Description>
            メール認証に失敗しました。トークンが無効または期限切れの可能性があります。
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Link
            href={urls.href({ route: '/sign-in' })}
            className="text-blue-500 hover:text-blue-500/80"
          >
            サインインページに戻る
          </Link>
        </Card.Footer>
      </GlowCard>
    )
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    unauthorized()
  }

  if (session.user.emailVerified) {
    redirect(urls.href({ route: '/' }))
  }

  return (
    <ResendVerificationEmailForm>
      <Card.Header className='space-y-4'>
        <Card.Title>メール認証が必要です</Card.Title>
        <Card.Description>
          メールアドレスを認証する必要があります。登録されたメールアドレスに認証メールを送信しました。
          <br />
          メールが届かない場合は、以下のボタンから再送信してください。
        </Card.Description>
      </Card.Header>
    </ResendVerificationEmailForm>
  )
}

