import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Card } from '~/components/ui/intent-ui/card'
import { ResetPasswordForm } from '~/features/auth/components/reset-password-form'
import { authSearchParamsCache } from '~/features/auth/types/search-params/auth-search-params-cache'
import type { NextPageProps } from '~/types'

export default async function ResetPasswordPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const { token } = await authSearchParamsCache.parse(searchParams)

  if (!token) {
    unauthorized()
  }

  return (
    <ResetPasswordForm>
      <Card.Header>
        <Card.Title>パスワードリセット</Card.Title>
        <Card.Description>新しいパスワードを入力してください</Card.Description>
      </Card.Header>
    </ResetPasswordForm>
  )
}
