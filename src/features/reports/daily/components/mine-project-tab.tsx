import type { InferResponseType } from 'hono'
import { redirect } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { ProjectSummaryTable } from '~/features/reports/daily/components/project-summary-table'
import type { client } from '~/lib/rpc'

type MineProjectTabProps = {
  summaryPromise: Promise<
    InferResponseType<(typeof client.api.dailies.mine)['summary-by-project']['$get'], 200>
  >
  page: number
  rowsPerPage: number
  startDate: Date | null
  endDate: Date | null
}

export default async function MineProjectTab({
  summaryPromise,
  page,
  rowsPerPage,
  startDate,
  endDate,
}: MineProjectTabProps) {
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
