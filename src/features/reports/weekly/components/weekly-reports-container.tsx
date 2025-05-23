import { QueryClient } from '@tanstack/react-query'

type WeeklyReportsContainerProps = {
  userId: string
  year: number
  week: number
}

export async function WeeklyReportsContainer({
  userId,
  year,
  week,
}: WeeklyReportsContainerProps) {
  const queryClient = new QueryClient()
  await fetchWeeklyReportsInfiniteQuery({ year, week }, userId).prefetch(
    queryClient,
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WeeklyReports userId={userId} year={year} week={week} />
    </HydrationBoundary>
  )
}
