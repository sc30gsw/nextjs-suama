import { redirect, unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { DailyReportsSearchUserForToday } from '~/features/reports/daily/components/daily-reports-search-user-for-today'
import { DailyReportsTableForToday } from '~/features/reports/daily/components/daily-reports-table-for-today'
import { DailyReportsTablePaginationForToday } from '~/features/reports/daily/components/daily-reports-table-pagination-for-today'
import { getReportsForToday } from '~/features/reports/daily/server/fetcher'
import { dailyReportForTodaySearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-for-today-search-params-cache'

import { getServerSession } from '~/lib/get-server-session'

export default async function DailyOfTodayPage({
  searchParams,
}: Record<'searchParams', Promise<SearchParams>>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { page, userNames } =
    await dailyReportForTodaySearchParamsCache.parse(searchParams)

  const reportsPromise = getReportsForToday(
    { skip: page <= 1 ? 0 : (page - 1) * 10, userNames },
    session.user.id,
  )

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-y-2">
      <Heading>本日の日報</Heading>
      <div>
        <DailyReportsSearchUserForToday />
      </div>
      <Card className="py-0 mt-4">
        <Suspense
          key={JSON.stringify({ page, userNames })}
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
                {Array.from({ length: 10 }, () => (
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
            <DailyReportsTableForToday reports={res} />
          ))}
        </Suspense>
      </Card>
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
          const pageCount = Math.ceil(res.total / 10)

          if (page > pageCount) {
            redirect(`/daily/today?page=${pageCount}`)
          }

          return (
            <DailyReportsTablePaginationForToday
              pageCount={pageCount}
              page={page}
            />
          )
        })}
      </Suspense>
    </div>
  )
}
