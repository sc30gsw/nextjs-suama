import { redirect, unauthorized } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT_KIND } from '~/constants/daily-report-kind'
import { DAILY_REPORT_TABS_MAP } from '~/constants/tabs'
import { getDailyReportsCount } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { getServerSession } from '~/lib/get-server-session'
import { urls } from '~/lib/urls'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { dateUtils } from '~/utils/date-utils'

type DailyReportsTabContentProps = {
  children: ReactNode
  kind: (typeof DAILY_REPORT_KIND)[keyof typeof DAILY_REPORT_KIND]
}

export async function DailyReportsTabContent({ children, kind }: DailyReportsTabContentProps) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { tab, startDate, endDate, userNames } = dailyReportPageSearchParamsCache.all()
  const { page, rowsPerPage } = paginationSearchParamsCache.all()

  const countDataPromise = getDailyReportsCount(
    {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      userId: kind === DAILY_REPORT_KIND.MINE ? session.user.id : undefined,
      userNames,
    },
    session.user.id,
  )

  return (
    <div className="space-y-2">
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <Suspense
          fallback={
            <>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-7 w-48" />
            </>
          }
        >
          {countDataPromise.then((countData) => {
            const total =
              tab === DAILY_REPORT_TABS_MAP.DATE.id
                ? countData.dailyReportsCount
                : countData.projectsCount

            return (
              <>
                <p className="text-sm">
                  全 {total} 件の{tab === DAILY_REPORT_TABS_MAP.DATE.id ? '日報' : 'プロジェクト'}
                </p>
                <div className="font-bold text-lg">総合計時間: {countData.totalHours} 時間</div>
              </>
            )
          })}
        </Suspense>
      </div>

      <Card className="max-w-full border-t-0 pt-0">
        <Card.Content>{children}</Card.Content>

        <Card.Footer>
          <Suspense
            fallback={
              <div className="flex w-full items-center justify-center gap-1">
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
            {countDataPromise.then((countData) => {
              const total =
                tab === DAILY_REPORT_TABS_MAP.DATE.id
                  ? countData.dailyReportsCount
                  : countData.projectsCount

              if (total > 0) {
                return null
              }

              const pageCount = Math.ceil(total / rowsPerPage)

              if (page > pageCount && pageCount > 0) {
                const redirectKindPath =
                  kind === DAILY_REPORT_KIND.MINE
                    ? DAILY_REPORT_KIND.MINE
                    : DAILY_REPORT_KIND.EVERYONE

                const route =
                  redirectKindPath === DAILY_REPORT_KIND.MINE
                    ? urls.href({ route: '/daily/mine' })
                    : urls.href({ route: '/daily/every' })

                redirect(
                  urls.build({
                    route,
                    searchParams: {
                      tab,
                      page: pageCount,
                      rowsPerPage,
                      startDate: dateUtils.formatDateParamForUrl(startDate),
                      endDate: dateUtils.formatDateParamForUrl(endDate),
                      userNames: userNames.join(','),
                    },
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
