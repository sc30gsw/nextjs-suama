import { forbidden, unauthorized } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { ChangePasswordForm } from '~/features/users/components/change-passwor-form'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function UserChangePasswordPage({
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
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <Heading>パスワード変更</Heading>
      <div className="flex flex-col items-center">
        <Card className="py-4 mt-4 w-full max-w-lg">
          <Card.Header>
            <Card.Title>パスワード変更</Card.Title>
            <Card.Description>ユーザーのパスワードを変更する</Card.Description>
          </Card.Header>
          <ChangePasswordForm id={userId} />
        </Card>
      </div>
    </div>
  )
}
