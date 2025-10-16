import type { InferResponseType } from 'hono'
import { redirect } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { ProjectSummaryTable } from '~/features/reports/daily/components/project-summary-table'
import { dailyReportForMineSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import type { client } from '~/lib/rpc'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

type MineProjectTabProps = {
  summaryPromise: Promise<
    InferResponseType<(typeof client.api.dailies.mine)['summary']['$get'], 200>
  >
}

export async function MineProjectTabPanel({ summaryPromise }: MineProjectTabProps) {
  const { startDate, endDate } = dailyReportForMineSearchParamsCache.all()
  const { page, rowsPerPage } = paginationSearchParamsCache.all()
  const summary = await summaryPromise

  // ページ数の計算とリダイレクト処理
  const pageCount = Math.ceil(summary.total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    redirect(
      `/daily/mine?tab=project&page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
    )
  }

  return (
    <>
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">全 {summary.total} 件のプロジェクト</p>
        <div className="font-bold text-lg">総合計時間: {summary.grandTotalHour} 時間</div>
      </div>

      <Card className="max-w-full border-t-0 pt-0 ">
        <Card.Content>
          <ProjectSummaryTable summary={summary.summary} />
        </Card.Content>

        <Card.Footer>
          <TablePagination pageCount={pageCount} page={page} />
        </Card.Footer>
      </Card>
    </>
  )
}
