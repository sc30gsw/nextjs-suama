'use client'

import type { Session } from 'better-auth'
import type { InferRequestType } from 'hono'
import { notFound } from 'next/navigation'
import { useRef } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Heading } from '~/components/ui/intent-ui/heading'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsCards } from '~/features/reports/weekly/components/weekly-reports-cards'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import type { client } from '~/lib/rpc'
import { WeeklyReportsNavigationButton } from './WeeklyReportsNavigationButton'

type WeeklyReportsProps = Pick<Session, 'userId'> &
  InferRequestType<(typeof client.api.weeklies)['last-week'][':year'][':week']['$get']>['param']

export function WeeklyReports({ userId, year, week }: WeeklyReportsProps) {
  const { use: useWeeklyReports } = fetchWeeklyReportsInfiniteQuery(
    { year: Number(year), week: Number(week) },
    userId,
  )

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

      <aside className="sticky top-20 hidden h-fit w-64 pr-4 lg:block">
        <nav className="flex flex-col gap-1 text-sm">
          <Heading level={5}>On this page</Heading>
          <WeeklyReportsNavigationButton data={data} virtuosoRef={virtuosoRef} />
        </nav>
      </aside>
    </>
  )
}
