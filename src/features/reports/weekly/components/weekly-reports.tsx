'use client'

import { notFound } from 'next/navigation'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsCards } from '~/features/reports/weekly/components/weekly-reports-cards'
import { WeeklyReportsNavigation } from '~/features/reports/weekly/components/weekly-reports-navigation'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'

type WeeklyReportsProps = {
  userId: string
  year: number
  week: number
}

export function WeeklyReports({ year, week, userId }: WeeklyReportsProps) {
  const { use: useWeeklyReports } = fetchWeeklyReportsInfiniteQuery({ year, week }, userId)

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWeeklyReports()

  if (isLoading) {
    return <WeeklyReportsCardLoading />
  }

  if (!data || error) {
    notFound()
  }

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }
  return (
    <>
      <div className="flex-1">
        <WeeklyReportsCards
          data={data}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadMore={loadMore}
        />
      </div>
      <WeeklyReportsNavigation data={data} />
    </>
  )
}
