import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { WeeklyRegisterLink } from '~/features/reports/weekly/components/weekly-register-link'
import { WeeklyReportsBackToTopButton } from '~/features/reports/weekly/components/weekly-reports-back-to-top-button'
import { WeeklyReportsContainer } from '~/features/reports/weekly/components/weekly-reports-container'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
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
  const queryClient = new QueryClient()
  await fetchWeeklyReportsInfiniteQuery(
    { year, week },
    session.user.id,
  ).prefetch(queryClient)

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-y-4">
        <Heading level={2}>
          {startDate} 〜 {endDate}
        </Heading>
        <Suspense fallback={<Skeleton className="w-41 h-10" />}>
          <WeeklyRegisterLink dates={dates} userId={session.user.id} />
        </Suspense>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <WeeklyReportsContainer
            userId={session.user.id}
            year={year}
            week={week}
          />
        </HydrationBoundary>
      </div>
      <WeeklyReportsBackToTopButton />
    </div>
  )
}
