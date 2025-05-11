import { unauthorized } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { DailyReportsTableForToday } from '~/features/reports/daily/components/daily-reports-table-for-today'
import { getServerSession } from '~/lib/get-server-session'

export default async function DailyOfTodayPage() {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <Heading>本日の日報</Heading>
      <Card className="py-0 mt-4">
        <DailyReportsTableForToday />
      </Card>
    </div>
  )
}
