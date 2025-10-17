import { redirect, unauthorized } from 'next/navigation'
import type { ReactNode } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { getDailyReportsCount } from '~/features/reports/daily/server/fetcher'
import { dailyReportForMineSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

type MineTabContentProps = {
  tab: (typeof DAILY_REPORT_MINE_TABS)[number]['id']
  children: ReactNode
}

export async function MineTabContent({ tab, children }: MineTabContentProps) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { startDate, endDate } = dailyReportForMineSearchParamsCache.all()
  const { page, rowsPerPage } = paginationSearchParamsCache.all()

  const countData = await getDailyReportsCount(
    {
      scope: 'mine',
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    },
    session.user.id,
  )

  const total = tab === DAILY_REPORT_MINE_TABS[0].id ? countData.dateTotal : countData.projectTotal

  const grandTotalHour = countData.grandTotalHour

  const pageCount = Math.ceil(total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    redirect(
      `/daily/mine?tab=${tab}&page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
    )
  }

  const itemLabel = tab === DAILY_REPORT_MINE_TABS[0].id ? '日報' : 'プロジェクト'

  return (
    <div className="space-y-2">
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">
          全 {total} 件の{itemLabel}
        </p>
        <div className="font-bold text-lg">総合計時間: {grandTotalHour} 時間</div>
      </div>

      <Card className="max-w-full border-t-0 pt-0">
        <Card.Content>{children}</Card.Content>

        <Card.Footer>
          <TablePagination pageCount={pageCount} page={page} />
        </Card.Footer>
      </Card>
    </div>
  )
}
