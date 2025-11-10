import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { TabPanel } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_TABS_MAP } from '~/constants/tabs'
import { DailyReportsProjectSummaryTable } from '~/features/reports/daily/components/daily-reports-project-summary-table'
import { DailyReportsSearchDateRangePicker } from '~/features/reports/daily/components/daily-reports-search-date-range-picker'
import { DailyReportsTabContent } from '~/features/reports/daily/components/daily-reports-tab-content'
import { DailyReportsTabContentSkeleton } from '~/features/reports/daily/components/daily-reports-tab-content-skeleton'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailyReportsTabs } from '~/features/reports/daily/components/daily-reports-tabs'
import { getDailyReports, getProjectSummary } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const minePageSearchParams = await dailyReportPageSearchParamsCache.parse(searchParams)
  const { page, rowsPerPage, tab, startDate, endDate } = minePageSearchParams

  const skip = paginationUtils.calculateSkip(page, rowsPerPage)
  const limit = paginationUtils.maxRowsLimit(rowsPerPage)

  return (
    <div className="flex flex-col gap-y-4 p-4 lg:p-6">
      <Heading>{session.user.name}の日報</Heading>

      <Form action="/daily/mine" className="flex gap-x-2">
        <input type="hidden" name="tab" value={tab} />
        <DailyReportsSearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、修正されたら Activity に変更する。
        https://github.com/vercel/next.js/issues/84489 */}
      <DailyReportsTabs currentTab={tab}>
        <TabPanel id={DAILY_REPORT_TABS_MAP.DATE.id}>
          <Suspense
            key={`date-${JSON.stringify(minePageSearchParams)}`}
            fallback={<DailyReportsTabContentSkeleton tab={DAILY_REPORT_TABS_MAP.DATE.id} />}
          >
            <DailyReportsTabContent userId={session.user.id}>
              {getDailyReports(
                {
                  skip,
                  limit,
                  startDate: startDate ?? undefined,
                  endDate: endDate ?? undefined,
                  userId: session.user.id,
                },
                session.user.id,
              ).then((data) => (
                <DailyReportsTable reports={data.dailyReports} userId={session.user.id} />
              ))}
            </DailyReportsTabContent>
          </Suspense>
        </TabPanel>

        <TabPanel id={DAILY_REPORT_TABS_MAP.PROJECT.id}>
          <Suspense
            key={`project-${JSON.stringify(minePageSearchParams)}`}
            fallback={<DailyReportsTabContentSkeleton tab={DAILY_REPORT_TABS_MAP.PROJECT.id} />}
          >
            <DailyReportsTabContent userId={session.user.id}>
              {getProjectSummary(
                {
                  startDate: startDate ?? undefined,
                  endDate: endDate ?? undefined,
                  limit,
                  skip,
                  userId: session.user.id,
                },
                session.user.id,
              ).then((data) => (
                <DailyReportsProjectSummaryTable summary={data.summary} />
              ))}
            </DailyReportsTabContent>
          </Suspense>
        </TabPanel>
      </DailyReportsTabs>
    </div>
  )
}
