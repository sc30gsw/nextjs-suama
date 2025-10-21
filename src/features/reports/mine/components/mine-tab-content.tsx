import { redirect, unauthorized } from 'next/navigation'
import type { ReactNode } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { getDailyReportsCount } from '~/features/reports/mine/server/fetcher'
import { dailyReportForMineSearchParamsCache } from '~/features/reports/mine/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { dateUtils } from '~/utils/date-utils'

export async function MineTabContent({ children }: Record<'children', ReactNode>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { tab, startDate, endDate } = dailyReportForMineSearchParamsCache.all()
  const { page, rowsPerPage } = paginationSearchParamsCache.all()

  const countData = await getDailyReportsCount(
    {
      kind: 'mine',
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    },
    session.user.id,
  )

  const total =
    tab === DAILY_REPORT_MINE_TABS[0].id ? countData.dailyReportsCount : countData.projectsCount

  const grandTotalHour = countData.totalHours

  const pageCount = Math.ceil(total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    const searchParams = new URLSearchParams({
      tab,
      page: String(pageCount),
      rowsPerPage: String(rowsPerPage),
      startDate: dateUtils.formatDateParamForUrl(startDate),
      endDate: dateUtils.formatDateParamForUrl(endDate),
    }).toString()

    redirect(`/daily/mine?${searchParams}`)
  }

  return (
    <div className="space-y-2">
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">
          全 {total} 件の{tab === DAILY_REPORT_MINE_TABS[0].id ? '日報' : 'プロジェクト'}
        </p>
        <div className="font-bold text-lg">総合計時間: {grandTotalHour} 時間</div>
      </div>

      <Card className="max-w-full border-t-0 pt-0">
        <Card.Content>{children}</Card.Content>

        <Card.Footer>
          <TablePagination pageCount={pageCount} />
        </Card.Footer>
      </Card>
    </div>
  )
}
