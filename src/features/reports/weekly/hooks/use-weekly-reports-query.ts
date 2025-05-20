import { useInfiniteQuery } from '@tanstack/react-query'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import { getWeeklyReport } from '~/features/reports/weekly/client/fetcher'

const LIMIT = 30

export function useWeeklyReportsQuery(
  params: Record<'year' | 'week', number>,
  userId?: string,
) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [GET_WEEKLY_REPORTS_CACHE_KEY, params, userId],
      queryFn: async ({ pageParam = 0 }) => {
        return await getWeeklyReport(params, pageParam, userId)
      },
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.reports.length === LIMIT
          ? allPages.length * LIMIT
          : undefined
      },
      initialPageParam: 0,
    })

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } as const
}
