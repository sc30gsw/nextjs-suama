'use client'
import { notFound } from 'next/navigation'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsCards } from '~/features/reports/weekly/components/weekly-reports-cards'
import { WeeklyReportsNavigation } from '~/features/reports/weekly/components/weekly-reports-navigation'
import { useWeeklyReportsQuery } from '~/features/reports/weekly/hooks/use-weekly-reports-query'

type WeeklyReportsContainerProps = {
  userId: string
  year: number
  week: number
}

export function WeeklyReportsContainer({
  userId,
  year,
  week,
}: WeeklyReportsContainerProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useWeeklyReportsQuery({ year, week }, userId)

  if (isLoading || !data) {
    return <WeeklyReportsCardLoading />
  }

  if (!data) {
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
