import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { MyConditionLink } from '~/features/reports/weekly/components/my-condition-link'
import { WeeklyRegisterLink } from '~/features/reports/weekly/components/weekly-register-link'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { getServerSession } from '~/lib/get-server-session'

export async function WeeklyReportsContainer({
  year,
  week,
  dates,
}: {
  year: string
  week: string
  dates: string
}) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const queryClient = new QueryClient()

  await fetchWeeklyReportsInfiniteQuery(
    { year: Number(year), week: Number(week) },
    session.user.id,
  ).prefetch(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReports userId={session.user.id} year={year} week={week}>
        <div className="flex flex-col items-start gap-y-2">
          <Suspense fallback={<Skeleton className="h-10 w-41" />}>
            <WeeklyRegisterLink
              dates={dates}
              userId={session.user.id}
              size="sm"
              className="text-xs"
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-41" />}>
            <MyConditionLink />
          </Suspense>
        </div>
      </WeeklyReports>
    </HydrationBoundary>
  )
}
