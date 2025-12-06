import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { InferRequestType } from 'hono'
import { unauthorized } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { WeeklyRegisterLink } from '~/features/reports/weekly/components/weekly-register-link'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { getServerSession } from '~/lib/get-server-session'
import type { client } from '~/lib/rpc'

export async function WeeklyReportsContainer({
  year,
  week,
  dates,
}: InferRequestType<(typeof client.api.weeklies)['last-week'][':year'][':week']['$get']>['param'] &
  Record<'dates', string>) {
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
        <Suspense fallback={<Skeleton className="h-10 w-41" />}>
          <WeeklyRegisterLink
            dates={dates}
            userId={session.user.id}
            size="sm"
            className="text-xs"
          />
        </Suspense>
      </WeeklyReports>
    </HydrationBoundary>
  )
}
