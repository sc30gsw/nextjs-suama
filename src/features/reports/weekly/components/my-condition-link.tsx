import { IconActivity } from '@tabler/icons-react'
import Link from 'next/link'
import { unauthorized } from 'next/navigation'
import { Button } from '~/components/ui/intent-ui/button'
import { getSlackUserLookupByEmail } from '~/features/slack/server/fetcher'
import { getServerSession } from '~/lib/get-server-session'

export async function MyConditionLink() {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const res = await getSlackUserLookupByEmail(session.user.email)

  if (!res.ok || !res.user?.id) {
    return null
  }

  return (
    <Link
      href={`https://ask-condition-app.claves-bigup-app.workers.dev/users/${res.user?.id}`}
      target="_blank"
      className="flex items-center gap-x-2"
    >
      <Button
        size="sm"
        className="bg-sky-600 text-white text-xs hover:bg-sky-600 hover:brightness-110"
      >
        自分の状態を確認する
        <IconActivity size={24} />
      </Button>
    </Link>
  )
}
