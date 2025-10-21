import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Session } from 'better-auth'
import type { InferRequestType } from 'hono'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import type { client } from '~/lib/rpc'

type WeeklyReportsContainerProps = Pick<Session, 'userId'> &
  InferRequestType<(typeof client.api.weeklies)['last-week'][':year'][':week']['$get']>['param']

export async function WeeklyReportsContainer({ userId, year, week }: WeeklyReportsContainerProps) {
  const queryClient = new QueryClient()

  await fetchWeeklyReportsInfiniteQuery(
    { year: Number(year), week: Number(week) },
    userId,
  ).prefetch(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReports userId={userId} year={year} week={week} />
    </HydrationBoundary>
  )
}
