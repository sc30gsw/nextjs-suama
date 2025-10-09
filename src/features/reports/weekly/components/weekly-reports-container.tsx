import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { InferSelectModel } from 'drizzle-orm'
import type { users } from '~/db/schema'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'

type WeeklyReportsContainerProps = {
  userId: InferSelectModel<typeof users>['id']
  year: number
  week: number
}

export async function WeeklyReportsContainer({ userId, year, week }: WeeklyReportsContainerProps) {
  const queryClient = new QueryClient()
  await fetchWeeklyReportsInfiniteQuery({ year, week }, userId).prefetch(queryClient)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReports userId={userId} year={year} week={week} />
    </HydrationBoundary>
  )
}
