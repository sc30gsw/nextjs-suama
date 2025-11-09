import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { getDailyReports } from '~/features/reports/daily/server/fetcher'
import { UserSearchTagField } from '~/features/users/components/user-search-tag-field'
import { userSearchParamsCache } from '~/features/users/types/search-params/user-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

export default async function DailyOfTodayPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ userNames }, { page, rowsPerPage }] = await Promise.all([
    userSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const reportsPromise = getDailyReports(
    {
      skip: page <= 1 ? 0 : (page - 1) * rowsPerPage,
      limit:
        rowsPerPage > MAX_ROWS_PER_PAGE
          ? MAX_ROWS_PER_PAGE
          : rowsPerPage < MIN_ROWS_PER_PAGE
            ? MIN_ROWS_PER_PAGE
            : rowsPerPage,
      userNames,
      today: true,
    },
    session.user.id,
  )

  return (
    <div className="flex flex-col gap-y-2 p-4 lg:p-6">
      <Heading>本日の日報</Heading>
      <div className="flex flex-row items-center gap-x-4 md:flex-col md:items-start md:gap-y-4">
        <UserSearchTagField />
        <RowsPerPageSelect />
      </div>
      <Card className="mt-4 max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <Suspense
            key={JSON.stringify({ page, rowsPerPage, userNames })}
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
              <DailyReportsTable reports={res.dailyReports} userId={session.user.id} />
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
                  `/daily/today?page=${pageCount}&rowsPerPage=${rowsPerPage}&userNames=${userNames}`,
                )
              }

              return <TablePagination pageCount={pageCount} />
            })}
          </Suspense>
        </Card.Footer>
      </Card>
    </div>
  )
}
