import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DailyReportTableSkeleton } from '~/features/reports/daily/components/daily-report-table-skeleton'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { getDailyReports } from '~/features/reports/daily/server/fetcher'
import { UserSearchTagField } from '~/features/users/components/user-search-tag-field'
import { userSearchParamsCache } from '~/features/users/types/search-params/user-search-params-cache'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { dateUtils } from '~/utils/date-utils'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function DailyForTodayPage({
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
      skip: paginationUtils.getOffset(page, rowsPerPage),
      limit: paginationUtils.getMaxRowsLimit(rowsPerPage),
      userNames,
      startDate: dateUtils.getTodayRangeByJST().start,
      endDate: dateUtils.getTodayRangeByJST().end,
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
            fallback={<DailyReportTableSkeleton />}
          >
            {reportsPromise.then((res) => (
              <DailyReportsTable reports={res.dailyReports} userId={session.user.id} />
            ))}
          </Suspense>
        </Card.Content>

        <Card.Footer>
          <Suspense
            fallback={
              <div className="flex w-full items-center justify-center gap-x-1">
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
              if (res.total === 0) {
                return null
              }

              const pageCount = Math.ceil(res.total / rowsPerPage)

              if (page > pageCount) {
                redirect(
                  urls.build({
                    route: '/daily/today',
                    searchParams: { page: pageCount, rowsPerPage, userNames },
                  } as Parameters<typeof urls.build>[0] & {
                    searchParams?: Record<string, unknown>
                  }).href,
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
