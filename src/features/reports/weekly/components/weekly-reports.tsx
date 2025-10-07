'use client'

import type { InferSelectModel } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { useRef } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import type { users } from '~/db/schema'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsCards } from '~/features/reports/weekly/components/weekly-reports-cards'
import { WeeklyReportsNavigation } from '~/features/reports/weekly/components/weekly-reports-navigation'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'

type WeeklyReportsProps = {
  userId: InferSelectModel<typeof users>['id']
  year: number
  week: number
}

export function WeeklyReports({ year, week, userId }: WeeklyReportsProps) {
  const { use: useWeeklyReports } = fetchWeeklyReportsInfiniteQuery({ year, week }, userId)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

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
          ref={virtuosoRef}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadMore={loadMore}
        />
      </div>
      <WeeklyReportsNavigation data={data} virtuosoRef={virtuosoRef} />
    </>
  )
}
