import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import Link from 'next/link'
import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT_MINE_TABS, MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { ProjectSummaryTable } from '~/features/reports/daily/components/ProjectSummaryTable'
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
        <DailySearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>

      <div className="border-b">
        <nav className="-mb-px flex gap-x-8" aria-label="Tabs">
          {DAILY_REPORT_MINE_TABS.map((TAB) => (
            <Link
              key={TAB.id}
              href={{
                query: {
                  ...(startDate && { startDate: startDate.toISOString().split('T')[0] }),
                  ...(endDate && { endDate: endDate.toISOString().split('T')[0] }),
                  page,
                  rowsPerPage,
                  tab: TAB.id,
                },
              }}
              className={cn(
                TAB.id === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                'whitespace-nowrap border-b-2 px-1 py-4 font-medium text-sm',
              )}
            >
              {TAB.name}
            </Link>
          ))}
        </nav>
      </div>

      {tab === 'date' && (
        <>
          <RowsPerPageSelect />

          <div className="flex items-end justify-between">
            <Suspense fallback={<Skeleton className="h-6 w-24" />}>
              {reportsPromise.then((res) => (
                <p className="text-sm">全 {res.total} 件の日報</p>
              ))}
            </Suspense>
            <Suspense fallback={<Skeleton className="h-8 w-48" />}>
              {reportsPromise.then((res) => (
                <div className="font-bold text-lg">総合計時間: {res.grandTotalHour} 時間</div>
              ))}
            </Suspense>
          </div>
          <Card className="max-w-full border-t-0 pt-0 ">
            <Card.Content>
              <Suspense
                key={JSON.stringify({ page, rowsPerPage, startDate, endDate })}
                fallback={
                  <table className="w-full text-left font-normal text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="w-30.75 p-3">日付</th>
                        <th className="w-28.25 p-3">ユーザー名</th>
                        <th className="w-24.25 p-3">合計時間</th>
                        <th className="w-87 p-3">所感</th>
                        <th className="w-32.75 p-3">リモート勤務</th>
                        <th className="w-24.25 p-3">提出</th>
                        <th className="w-90 p-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rowsPerPage }, () => (
                        <tr key={crypto.randomUUID()} className="border-b">
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-15" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-82" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th scope="row" className="flex items-center gap-x-2 p-4">
                            <Skeleton className="h-9 w-26" />
                            <Skeleton className="h-9 w-19" />
                            <Skeleton className="h-9 w-19" />
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              >
                {reportsPromise.then((res) => (
                  <DailyReportsTable<'mine'> reports={res} userId={session.user.id} />
                ))}
              </Suspense>
            </Card.Content>
            <Card.Footer>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center gap-x-1">
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                    <Skeleton className="h-9 w-10 rounded-md" />
                  </div>
                }
              >
                {reportsPromise.then((res) => {
                  const pageCount = Math.ceil(res.total / rowsPerPage)

                  if (page > pageCount) {
                    redirect(
                      `/daily/mine?page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
                    )
                  }

                  return <TablePagination pageCount={pageCount} page={page} />
                })}
              </Suspense>
            </Card.Footer>
          </Card>
        </>
      )}

      {tab === 'project' && (
        <>
          <RowsPerPageSelect />

          <div className="flex items-end justify-between">
            <Suspense fallback={<Skeleton className="h-6 w-24" />}>
              {summaryPromise.then((summary) => (
                <p className="text-sm">全 {summary.total} 件のプロジェクト</p>
              ))}
            </Suspense>

            <Suspense fallback={<Skeleton className="h-8 w-48" />}>
              {reportsPromise.then((res) => (
                <div className="font-bold text-lg">総合計時間: {res.grandTotalHour} 時間</div>
              ))}
            </Suspense>
          </div>

          <Card className="max-w-full border-t-0 pt-0 ">
            <Card.Content>
              <Suspense
                key={JSON.stringify({ startDate, endDate, rowsPerPage })}
                fallback={
                  <table className="w-full text-left font-normal text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3">プロジェクト名</th>
                        <th className="p-3">合計勤務時間</th>
                        <th className="p-3">作業日数</th>
                        <th className="p-3">期間</th>
                        <th className="p-3">平均作業時間/日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rowsPerPage }, () => (
                        <tr key={crypto.randomUUID()} className="border-b">
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-32" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-24" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-48" />
                          </th>
                          <th scope="row" className="p-4">
                            <Skeleton className="h-4 w-24" />
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              >
                {summaryPromise.then((summary) => (
                  <ProjectSummaryTable summary={summary.summary} />
                ))}
              </Suspense>
            </Card.Content>
            <Card.Footer>
              <Suspense fallback={<Skeleton className="h-9 w-full" />}>
                {summaryPromise.then((summary) => {
                  const pageCount = Math.ceil(summary.total / rowsPerPage)
                  if (page > pageCount) {
                    redirect(
                      `/daily/mine?tab=project&page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
                    )
                  }
                  return <TablePagination pageCount={pageCount} page={page} />
                })}
              </Suspense>
            </Card.Footer>
          </Card>
        </>
      )}
    </div>
  )
}
