import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { getReportsForMine } from '~/features/reports/daily/server/fetcher'
import { dailyReportForMineSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ startDate, endDate }, { page, rowsPerPage }] = await Promise.all([
    dailyReportForMineSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const reportsPromise = getReportsForMine(
    {
      skip: page <= 1 ? 0 : (page - 1) * rowsPerPage,
      limit:
        rowsPerPage > MAX_ROWS_PER_PAGE
          ? MAX_ROWS_PER_PAGE
          : rowsPerPage < MIN_ROWS_PER_PAGE
            ? MIN_ROWS_PER_PAGE
            : rowsPerPage,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    },
    session.user.id,
  )

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-4">
      <Heading>{session.user.name}の日報</Heading>
      <Form action="/daily/mine" className="flex gap-x-2">
        <DailySearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>
      <RowsPerPageSelect />

      <Card className="py-2 mt-4 max-w-full">
        <Card.Content>
          <Suspense
            key={JSON.stringify({ page, rowsPerPage, startDate, endDate })}
            fallback={
              <table className="w-full text-sm text-left font-normal">
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
                        <Skeleton className="w-20 h-4" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="w-20 h-4" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="w-15 h-4" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="w-82 h-4" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="w-20 h-4" />
                      </th>
                      <th scope="row" className="p-4">
                        <Skeleton className="w-20 h-4" />
                      </th>
                      <th scope="row" className="p-4 flex items-center gap-x-2">
                        <Skeleton className="w-26 h-9" />
                        <Skeleton className="w-19 h-9" />
                        <Skeleton className="w-19 h-9" />
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            {reportsPromise.then((res) => (
              <DailyReportsTable<'mine'> reports={res} />
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
    </div>
  )
}
