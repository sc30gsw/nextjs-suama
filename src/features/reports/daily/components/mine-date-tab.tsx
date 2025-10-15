import type { InferResponseType } from 'hono'
import { redirect } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { dailyReportForMineSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

type MineDateTabProps = {
  reportsPromise: Promise<InferResponseType<typeof client.api.dailies.mine.$get, 200>>
  userId: InferResponseType<typeof client.api.dailies.mine.$get, 200>['userId']
}

export async function MineDateTab({ reportsPromise, userId }: MineDateTabProps) {
  const { startDate, endDate } = dailyReportForMineSearchParamsCache.all()
  const { page, rowsPerPage } = paginationSearchParamsCache.all()
  const reports = await reportsPromise

  const pageCount = Math.ceil(reports.total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    redirect(
      `/daily/mine?tab=date&page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
    )
  }

  return (
    <>
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">全 {reports.total} 件の日報</p>
        <div className="font-bold text-lg">総合計時間: {reports.grandTotalHour} 時間</div>
      </div>

      <Card className="max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <DailyReportsTable<'mine'> reports={reports} userId={userId} />
        </Card.Content>

        <Card.Footer>
          <TablePagination pageCount={pageCount} page={page} />
        </Card.Footer>
      </Card>
    </>
  )
}
