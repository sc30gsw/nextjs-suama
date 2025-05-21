import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { WeeklyCalendarHint } from '~/features/reports/weekly/components/weekly-calendar-hint'
import { WeeklyRegisterLink } from '~/features/reports/weekly/components/weekly-register-link'
import { WeeklyReportsBackToTopButton } from '~/features/reports/weekly/components/weekly-reports-back-to-top-button'
import { WeeklyReportsContainer } from '~/features/reports/weekly/components/weekly-reports-container'
import {
  getYearAndWeek,
  splitDates,
} from '~/features/reports/weekly/utils/date-utils'

import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function WeeklyReportsPage({
  params,
}: NextPageProps<Record<'dates', string>>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { dates } = await params
  const { startDate, endDate } = splitDates(dates)
  const { year, week } = getYearAndWeek(startDate)

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <WeeklyCalendarHint
              label="追加する予定の期間"
              startDay={new Date(startDate)}
              endDay={new Date(endDate)}
            >
              <Heading level={2} className="underline cursor-pointer">
                {startDate} 〜 {endDate}
              </Heading>
            </WeeklyCalendarHint>
            <Heading level={2}>の予定一覧</Heading>
          </div>
          <p className="ml-4 text-sm text-muted-fg">
            ※ 日付をクリックすると、予定のカレンダーが表示されます。
          </p>
        </div>

        <Suspense fallback={<Skeleton className="w-41 h-10" />}>
          <WeeklyRegisterLink dates={dates} userId={session.user.id} />
        </Suspense>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <WeeklyReportsContainer
          userId={session.user.id}
          year={year}
          week={week}
        />
      </div>
      <WeeklyReportsBackToTopButton />
    </div>
  )
}
