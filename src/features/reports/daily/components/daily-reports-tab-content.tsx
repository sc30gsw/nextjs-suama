import { redirect, unauthorized } from 'next/navigation'
import type { ReactNode } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT_BASE_PATH, DAILY_REPORT_KIND } from '~/constants/daily-report-kind'
import { DAILY_REPORT_TABS_MAP } from '~/constants/tabs'
import { getDailyReportsCount } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { getServerSession } from '~/lib/get-server-session'
import { dateUtils } from '~/utils/date-utils'

type DailyReportsTabContentProps = {
  reportsTable: ReactNode
  kind: (typeof DAILY_REPORT_KIND)[keyof typeof DAILY_REPORT_KIND]
}

export async function DailyReportsTabContent({ reportsTable, kind }: DailyReportsTabContentProps) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { page, rowsPerPage, tab, startDate, endDate, userNames } =
    dailyReportPageSearchParamsCache.all()

  const countData = await getDailyReportsCount(
    {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      userId: kind === DAILY_REPORT_KIND.MINE ? session.user.id : undefined,
      userNames,
    },
    session.user.id,
  )

  const total =
    tab === DAILY_REPORT_TABS_MAP.DATE.id ? countData.dailyReportsCount : countData.projectsCount

  const pageCount = Math.ceil(total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    const searchParams = new URLSearchParams({
      tab,
      page: pageCount.toString(),
      rowsPerPage: rowsPerPage.toString(),
      startDate: dateUtils.formatDateParamForUrl(startDate),
      endDate: dateUtils.formatDateParamForUrl(endDate),
      userNames: userNames.join(','),
    }).toString()

    const redirectKindPath =
      kind === DAILY_REPORT_KIND.MINE ? DAILY_REPORT_KIND.MINE : DAILY_REPORT_KIND.EVERYONE

    redirect(`${DAILY_REPORT_BASE_PATH}/${redirectKindPath}/?${searchParams}`)
  }

  return (
    <div className="space-y-2">
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">
          全 {total} 件の{tab === DAILY_REPORT_TABS_MAP.DATE.id ? '日報' : 'プロジェクト'}
        </p>
        <div className="font-bold text-lg">総合計時間: {countData.totalHours} 時間</div>
      </div>

      <Card className="max-w-full border-t-0 pt-0">
        <Card.Content>{reportsTable}</Card.Content>

        {total > 0 && (
          <Card.Footer>
            <TablePagination pageCount={pageCount} />
          </Card.Footer>
        )}
      </Card>
    </div>
  )
}
