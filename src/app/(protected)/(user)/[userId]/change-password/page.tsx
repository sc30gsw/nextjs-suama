import { forbidden, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { GlowCard } from '~/components/ui/glow-card'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { authSearchParamsCache } from '~/features/auth/types/search-params/auth-search-params-cache'
import { ChangePasswordForm } from '~/features/users/components/change-password-form'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function UserChangePasswordPage({
  params,
  searchParams,
}: NextPageProps<Record<'userId', string>, SearchParams>) {
  const session = await getServerSession()

  const { token } = await authSearchParamsCache.parse(searchParams)

  if (!session || !token) {
    unauthorized()
  }

  const { userId } = await params

  if (userId !== session.user.id) {
    forbidden()
  }

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>パスワード変更</Heading>
      <div className="flex flex-col items-center">
        <GlowCard className="mt-4 w-full max-w-lg py-4">
          <Card.Header>
            <Card.Title>パスワード変更</Card.Title>
            <Card.Description>ユーザーのパスワードを変更する</Card.Description>
          </Card.Header>
          <ChangePasswordForm id={userId} />
        </GlowCard>
      </div>
    </div>
  )
}
