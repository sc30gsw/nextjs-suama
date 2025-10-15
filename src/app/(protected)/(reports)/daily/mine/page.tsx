import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import Link from 'next/link'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

import { DAILY_REPORT_MINE_TABS, MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import MineDateTab from '~/features/reports/daily/components/mine-date-tab'
import MineProjectTab from '~/features/reports/daily/components/mine-project-tab'
import {
  getProjectSummaryForMine,
  getReportsForMine,
} from '~/features/reports/daily/server/fetcher'
import {
  dailyReportForMineSearchParamsCache,
  tabSearchParamsCache,
} from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { cn } from '~/utils/classes'
import { dateUtils } from '~/utils/date-utils'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ tab }, { startDate, endDate }, { page, rowsPerPage }] = await Promise.all([
    tabSearchParamsCache.parse(searchParams),
    dailyReportForMineSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const skip = page <= 1 ? 0 : (page - 1) * rowsPerPage
  const limit =
    rowsPerPage > MAX_ROWS_PER_PAGE
      ? MAX_ROWS_PER_PAGE
      : rowsPerPage < MIN_ROWS_PER_PAGE
        ? MIN_ROWS_PER_PAGE
        : rowsPerPage

  const reportsPromise = getReportsForMine(
    {
      skip,
      limit,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    },
    session.user.id,
  )

  const summaryPromise = getProjectSummaryForMine(
    {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      limit,
      skip,
    },
    session.user.id,
  )

  return (
    <div className="flex flex-col gap-y-4 p-4 lg:p-6">
      <Heading>{session.user.name}の日報</Heading>
      <Form action="/daily/mine" className="flex gap-x-2">
        <input type="hidden" name="tab" value={tab} />
        <DailySearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>

      {/* // ?: intent ui の tab だと、react area のバージョンアップの必要があり、既存コンポーネントの影響範囲が大きかったこと。
      また、ページネーションの挙動が不安定で修正が難しかったことからLinkで代用 */}
      <div className="border-b">
        <nav className="flex gap-x-2" aria-label="Tabs">
          {DAILY_REPORT_MINE_TABS.map((TAB) => (
            <Link
              key={TAB.id}
              href={{
                query: {
                  ...(startDate && { startDate: dateUtils.formatDateByJST(startDate) }),
                  ...(endDate && { endDate: dateUtils.formatDateByJST(endDate) }),
                  page: 1,
                  rowsPerPage,
                  tab: TAB.id,
                },
              }}
              className={cn(
                TAB.id === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                'inline-flex items-center whitespace-nowrap border-b-2 px-4 py-2 font-medium text-sm transition-colors',
              )}
            >
              {TAB.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* // TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、条件付きレンダリングを使用。
      修正されたら Activity に変更する。
      https://github.com/vercel/next.js/issues/84489 */}
      {tab === 'date' && (
        <Suspense
          fallback={
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-32" />
              </div>

              <div className="flex items-end justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-48" />
              </div>

              <Card className="max-w-full border-t-0 pt-0 ">
                <Card.Content>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-x-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card.Content>

                <Card.Footer>
                  <Skeleton className="h-10 w-full" />
                </Card.Footer>
              </Card>
            </>
          }
        >
          <MineDateTab
            key={`date-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
            reportsPromise={reportsPromise}
            page={page}
            rowsPerPage={rowsPerPage}
            startDate={startDate}
            endDate={endDate}
            userId={session.user.id}
          />
        </Suspense>
      )}

      {tab === 'project' && (
        <Suspense
          fallback={
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-32" />
              </div>

              <div className="flex items-end justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-48" />
              </div>

              <Card className="max-w-full border-t-0 pt-0 ">
                <Card.Content>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-x-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card.Content>

                <Card.Footer>
                  <Skeleton className="h-10 w-full" />
                </Card.Footer>
              </Card>
            </>
          }
        >
          <MineProjectTab
            key={`project-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
            summaryPromise={summaryPromise}
            page={page}
            rowsPerPage={rowsPerPage}
            startDate={startDate}
            endDate={endDate}
          />
        </Suspense>
      )}
    </div>
  )
}
