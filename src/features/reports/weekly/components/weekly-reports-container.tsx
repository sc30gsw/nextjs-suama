import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { WeeklyReports } from '~/features/reports/weekly/components/weekly-reports'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import type { auth } from '~/lib/auth'

type WeeklyReportsContainerProps = {
  userId: typeof auth.$Infer.Session.user.id
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
