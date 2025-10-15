import type { InferResponseType } from 'hono'
import { redirect } from 'next/navigation'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import type { client } from '~/lib/rpc'

type MineDateTabProps = {
  reportsPromise: Promise<InferResponseType<typeof client.api.dailies.mine.$get, 200>>
  page: number
  rowsPerPage: number
  startDate: Date | null
  endDate: Date | null
  userId: InferResponseType<typeof client.api.dailies.mine.$get, 200>['userId']
}

export default async function MineDateTab({
  reportsPromise,
  page,
  rowsPerPage,
  startDate,
  endDate,
  userId,
}: MineDateTabProps) {
  const reports = await reportsPromise

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
          {(() => {
            const pageCount = Math.ceil(reports.total / rowsPerPage)

            if (page > pageCount && pageCount > 0) {
              redirect(
                `/daily/mine?tab=date&page=${pageCount}&rowsPerPage=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`,
              )
            }

            return <TablePagination pageCount={pageCount} page={page} />
          })()}
        </Card.Footer>
      </Card>
    </>
  )
}
