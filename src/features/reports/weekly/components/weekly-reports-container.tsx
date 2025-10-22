import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { InferRequestType } from 'hono'
import { unauthorized } from 'next/navigation'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import { getServerSession } from '~/lib/get-server-session'
import type { client } from '~/lib/rpc'

type WeeklyReportsContainerProps = InferRequestType<
  (typeof client.api.weeklies)['last-week'][':year'][':week']['$get']
>['param']

export async function WeeklyReportsContainer({ year, week }: WeeklyReportsContainerProps) {
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
      <WeeklyReports userId={session.user.id} year={year} week={week} />
    </HydrationBoundary>
  )
}
