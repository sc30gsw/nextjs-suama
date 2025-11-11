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
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailyReportsTabs } from '~/features/reports/daily/components/daily-reports-tabs'
import { DailyReportsProjectSummaryTableSkeleton } from '~/features/reports/daily/components/skelton/daily-reports-project-summary-table-skeleton'
import { DailyReportsTableSkeleton } from '~/features/reports/daily/components/skelton/daily-reports-table-skeleton'
import { getDailyReports, getProjectSummary } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { UserSearchTagField } from '~/features/users/components/user-search-tag-field'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function EveryDailyReportPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const dailyPageSearchParams = await dailyReportPageSearchParamsCache.parse(searchParams)
  const { page, rowsPerPage, tab, startDate, endDate, userNames } = dailyPageSearchParams

  const skip = paginationUtils.getOffset(page, rowsPerPage)
  const limit = paginationUtils.getMaxRowsLimit(rowsPerPage)

  return (
    <div className="flex flex-col gap-y-4 p-4 lg:p-6">
      <Heading>みんなの日報</Heading>

      <Form action="/daily/every" className="flex gap-x-2">
        <input type="hidden" name="tab" value={tab} />
        <DailyReportsSearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>

      <UserSearchTagField />

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、修正されたら Activity に変更する。
        https://github.com/vercel/next.js/issues/84489 */}
      <DailyReportsTabs currentTab={tab}>
        <TabPanel id={DAILY_REPORT_TABS_MAP.DATE.id}>
          <DailyReportsTabContent
            reportsTable={
              <Suspense
                key={`date-${JSON.stringify(dailyPageSearchParams)}`}
                fallback={<DailyReportsTableSkeleton />}
              >
                {getDailyReports(
                  {
                    skip,
                    limit,
                    startDate: startDate ?? undefined,
                    endDate: endDate ?? undefined,
                    userNames,
                  },
                  session.user.id,
                ).then((data) => (
                  <DailyReportsTable reports={data.dailyReports} userId={session.user.id} />
                ))}
              </Suspense>
            }
          />
        </TabPanel>

        <TabPanel id={DAILY_REPORT_TABS_MAP.PROJECT.id}>
          <DailyReportsTabContent
            reportsTable={
              <Suspense
                key={`project-${JSON.stringify(dailyPageSearchParams)}`}
                fallback={<DailyReportsProjectSummaryTableSkeleton />}
              >
                {getProjectSummary(
                  {
                    skip,
                    limit,
                    startDate: startDate ?? undefined,
                    endDate: endDate ?? undefined,
                    userNames,
                  },
                  session.user.id,
                ).then((data) => (
                  <DailyReportsProjectSummaryTable summary={data.summary} />
                ))}
              </Suspense>
            }
          />
        </TabPanel>
      </DailyReportsTabs>
    </div>
  )
}
