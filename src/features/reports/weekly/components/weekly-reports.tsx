'use client'

import type { Session } from 'better-auth'
import type { InferRequestType } from 'hono'
import { notFound } from 'next/navigation'
import { type ReactNode, useRef } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Note } from '~/components/ui/intent-ui/note'
import { WeeklyReportsBackToTopButton } from '~/features/reports/weekly/components/weekly-reports-back-to-top-button'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsCards } from '~/features/reports/weekly/components/weekly-reports-cards'
import { WeeklyReportsNavigationButton } from '~/features/reports/weekly/components/weekly-reports-navigation-button'
import { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'
import type { client } from '~/lib/rpc'

type WeeklyReportsProps = Pick<Session, 'userId'> &
  InferRequestType<(typeof client.api.weeklies)['last-week'][':year'][':week']['$get']>['param'] &
  Record<'children', ReactNode>

export function WeeklyReports({ userId, year, week, children }: WeeklyReportsProps) {
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

  const hasAnyReports = data.pages.some((page) =>
    page.reports.some((report) => {
      const hasLastWeek = report.lastWeekReports.length > 0
      const hasDaily = report.dailyReports.length > 0
      const hasNextWeek = report.nextWeekReports.length > 0

      return hasLastWeek || hasDaily || hasNextWeek
    }),
  )

  if (!hasAnyReports) {
    return (
      <div className="flex-1">
        <Note intent="danger">
          <p>この週には、前週の予定・今週の日報・次週の予定がまだ登録されていません。</p>
          <p className="mt-1">週報や日報を登録してから再度、ご確認ください。</p>
        </Note>
      </div>
    )
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
          userId={userId}
        >
          {children}
        </WeeklyReportsCards>
      </div>

      <aside className="sticky top-20 hidden h-fit w-64 pr-4 lg:block">
        <div className="flex flex-col gap-1 text-sm">
          <Heading level={5}>On this page</Heading>
          <nav className="flex h-[calc(100vh-121px)] flex-col gap-1 overflow-y-auto">
            <WeeklyReportsNavigationButton data={data} virtuosoRef={virtuosoRef} />
          </nav>
        </div>
      </aside>

      <WeeklyReportsBackToTopButton virtuosoRef={virtuosoRef} />
    </>
  )
}
