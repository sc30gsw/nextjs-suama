import { IconPlus } from '@intentui/icons'
import Link from 'next/link'
import { unauthorized } from 'next/navigation'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { LinkLoadingIndicator } from '~/components/ui/link-loading-indicator'
import { WeeklyReportsCard } from '~/features/reports/weekly/components/weekly-reports-card'

import { getServerSession } from '~/lib/get-server-session'

export default async function WeeklyReportsPage({
  params,
}: {
  params: Promise<{ dates: string }>
}) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { dates } = await params

  const [startDate, endDate] = dates.split('-').reduce((acc, val, i) => {
    if (i % 3 === 0) {
      acc.push(val)
    } else {
      acc[acc.length - 1] += `-${val}`
    }
    return acc
  }, [] as string[])

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-y-4">
        <Heading level={2}>
          {startDate} 〜 {endDate}
        </Heading>
        <Link href={'/weekly/register'} prefetch={false} className="max-w-fit">
          <Button>
            次週の予定を追加
            <LinkLoadingIndicator>
              <IconPlus />
            </LinkLoadingIndicator>
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <WeeklyReportsCard
          userId={session.user.id}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  )
}
