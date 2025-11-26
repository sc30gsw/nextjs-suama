import { forbidden, unauthorized } from 'next/navigation'
import { GlowCard } from '~/components/ui/glow-card'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { EditUserForm } from '~/features/users/components/edit-user-form'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function UserSettingsPage({
  params,
}: NextPageProps<Record<'userId', string>>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { userId } = await params

  if (userId !== session.user.id) {
    forbidden()
  }

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>ユーザー設定</Heading>
      <div className="flex flex-col items-center">
        <GlowCard className="mt-4 w-full max-w-lg py-4">
          <Card.Header>
            <Card.Title>ユーザー情報</Card.Title>
            <Card.Description>ユーザー情報を編集する</Card.Description>
          </Card.Header>
          <EditUserForm
            id={userId}
            name={session.user.name}
            email={session.user.email}
            image={session.user.image ?? null}
          />
        </GlowCard>
      </div>
    </div>
  )
}
