import type { Session } from 'better-auth'
import { redirect, unauthorized } from 'next/navigation'
import type { ReactNode } from 'react'
import { Card } from '~/components/ui/intent-ui/card'
import { RowsPerPageSelect } from '~/components/ui/pagination/rows-per-page-select'
import { TablePagination } from '~/components/ui/pagination/table-pagination'
import { DAILY_REPORT } from '~/constants'
import { getDailyReportsCount } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { getServerSession } from '~/lib/get-server-session'
import { DATE_FORMAT, dateUtils } from '~/utils/date-utils'

type DailyTabContentProps = {
  children: ReactNode
  userId?: Session['userId']
}

export async function DailyTabContent({ children, userId }: DailyTabContentProps) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const { page, rowsPerPage, tab, startDate, endDate, userNames } =
    dailyReportPageSearchParamsCache.all()

  const startDateStr = startDate ? dateUtils.formatDateByJST(startDate, DATE_FORMAT) : undefined
  const endDateStr = endDate ? dateUtils.formatDateByJST(endDate, DATE_FORMAT) : undefined
  const userNamesStr = userNames && userNames.length > 0 ? userNames.join(',') : undefined

  const countData = await getDailyReportsCount(
    {
      startDate: startDateStr,
      endDate: endDateStr,
      userId: userId,
      userNames: userNamesStr,
    },
    session.user.id,
  )

  const total =
    tab === DAILY_REPORT.TABS[0].id ? countData.dailyReportsCount : countData.projectsCount
  const totalHour = countData.totalHours

  const pageCount = Math.ceil(total / rowsPerPage)

  if (page > pageCount && pageCount > 0) {
    const searchParams = new URLSearchParams({
      tab,
      page: pageCount.toString(),
      rowsPerPage: rowsPerPage.toString(),
      startDate: dateUtils.formatDateParamForUrl(startDate),
      endDate: dateUtils.formatDateParamForUrl(endDate),
    }).toString()

    const redirectKindPath = userId ? 'mine' : 'every'

    redirect(`/daily/${redirectKindPath}/?${searchParams}`)
  }

  return (
    <div className="space-y-2">
      <RowsPerPageSelect />

      <div className="flex items-end justify-between">
        <p className="text-sm">
          全 {total} 件の{tab === DAILY_REPORT.TABS[0].id ? '日報' : 'プロジェクト'}
        </p>
        <div className="font-bold text-lg">総合計時間: {totalHour} 時間</div>
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
