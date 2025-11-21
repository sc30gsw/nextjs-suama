import { QueryClient } from '@tanstack/react-query'
import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { WeeklyCalendarHint } from '~/features/reports/weekly/components/weekly-calendar-hint'
import { WeeklyRegisterLink } from '~/features/reports/weekly/components/weekly-register-link'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsContainer } from '~/features/reports/weekly/components/weekly-reports-container'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { getYearAndWeek, splitDates } from '~/features/reports/weekly/utils/weekly-date-utils'

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
  const queryClient = new QueryClient()
  await fetchWeeklyReportsInfiniteQuery({ year, week }, session.user.id).prefetch(queryClient)

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <WeeklyCalendarHint
              label="追加する予定の期間"
              startDay={new Date(startDate)}
              endDay={new Date(endDate)}
            >
              <Heading level={2} className="cursor-pointer underline">
                {startDate} 〜 {endDate}
              </Heading>
            </WeeklyCalendarHint>
            <Heading level={2}>の予定一覧</Heading>
          </div>
          <p className="ml-4 text-muted-fg text-sm">
            ※ 日付をクリックすると、予定のカレンダーが表示されます。
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-10 w-41" />}>
          <WeeklyRegisterLink dates={dates} userId={session.user.id} />
        </Suspense>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <Suspense fallback={<WeeklyReportsCardLoading />}>
          <WeeklyReportsContainer year={year.toString()} week={week.toString()} />
        </Suspense>
      </div>
    </div>
  )
}
