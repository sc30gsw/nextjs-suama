import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { TabPanel } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_BASE_PATH, DAILY_REPORT_KIND } from '~/constants/daily-report-kind'
import { DAILY_REPORT_TABS_MAP } from '~/constants/tabs'
import { DailyReportTableSkeleton } from '~/features/reports/daily/components/daily-report-table-skeleton'
import { DailyReportsProjectSummaryTable } from '~/features/reports/daily/components/daily-reports-project-summary-table'
import { DailyReportsSearchDateRangePicker } from '~/features/reports/daily/components/daily-reports-search-date-range-picker'
import { DailyReportsTabContent } from '~/features/reports/daily/components/daily-reports-tab-content'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailyReportsTabs } from '~/features/reports/daily/components/daily-reports-tabs'
import { getDailyReports, getProjectSummary } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { UserSearchTagField } from '~/features/users/components/user-search-tag-field'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'
import { paginationUtils } from '~/utils/pagination-utils'

export default async function EveryDailyReportPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ tab, startDate, endDate, userNames }, { page, rowsPerPage }] = await Promise.all([
    dailyReportPageSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const skip = paginationUtils.getOffset(page, rowsPerPage)
  const limit = paginationUtils.getMaxRowsLimit(rowsPerPage)

  return (
    <div className="flex flex-col gap-y-4 p-4 lg:p-6">
      <Heading>みんなの日報</Heading>

      <Form
        action={`${DAILY_REPORT_BASE_PATH}/${DAILY_REPORT_KIND.EVERYONE}`}
        className="grid grid-cols-1 gap-y-4"
      >
        <input type="hidden" name="tab" value={tab} />
        <div className="flex flex-col gap-y-4 md:flex-row md:gap-x-2">
          <DailyReportsSearchDateRangePicker />
          <Button type="submit" className="w-full md:w-auto">
            検索
            <IconSearch />
          </Button>
        </div>

        <UserSearchTagField />
      </Form>

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、修正されたら Activity に変更する。
        https://github.com/vercel/next.js/issues/84489 */}
      <DailyReportsTabs>
        <TabPanel id={DAILY_REPORT_TABS_MAP.DATE.id}>
          <Suspense
            key={`date-${JSON.stringify({ page, rowsPerPage, userNames, startDate, endDate, tab })}`}
          >
            <DailyReportsTabContent kind={DAILY_REPORT_KIND.EVERYONE}>
              <Suspense fallback={<DailyReportTableSkeleton />}>
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
            </DailyReportsTabContent>
          </Suspense>
        </TabPanel>

        <TabPanel id={DAILY_REPORT_TABS_MAP.PROJECT.id}>
          <Suspense
            key={`date-${JSON.stringify({ page, rowsPerPage, userNames, startDate, endDate, tab })}`}
          >
            <DailyReportsTabContent kind={DAILY_REPORT_KIND.EVERYONE}>
              <Suspense fallback={<DailyReportTableSkeleton isTabProject />}>
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
                  <DailyReportsProjectSummaryTable summaries={data.summaries} />
                ))}
              </Suspense>
            </DailyReportsTabContent>
          </Suspense>
        </TabPanel>
      </DailyReportsTabs>
    </div>
  )
}
