import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Session } from 'better-auth'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'

type WeeklyReportsContainerProps = {
  userId: Session['userId']
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
