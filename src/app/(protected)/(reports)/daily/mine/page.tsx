import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { TabPanel } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_TABS, MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { DailyTabContent } from '~/features/reports/daily/components/daily-tab-content'
import { DailyTabContentSkeleton } from '~/features/reports/daily/components/daily-tab-content-skeleton'
import { DailyTabs } from '~/features/reports/daily/components/daily-tabs'
import { ProjectSummaryTable } from '~/features/reports/daily/components/project-summary-table'
import { getDailyReports, getProjectSummary } from '~/features/reports/daily/server/fetcher'
import { dailyReportPageSearchParamsCache } from '~/features/reports/daily/types/search-params/daily-report-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const minePageSearchParams = await dailyReportPageSearchParamsCache.parse(searchParams)
  const { page, rowsPerPage, tab, startDate, endDate } = minePageSearchParams

  const skip = page <= 1 ? 0 : (page - 1) * rowsPerPage

  const limit =
    rowsPerPage > MAX_ROWS_PER_PAGE
      ? MAX_ROWS_PER_PAGE
      : rowsPerPage < MIN_ROWS_PER_PAGE
        ? MIN_ROWS_PER_PAGE
        : rowsPerPage

  return (
    <div className="flex flex-col gap-y-4 p-4 lg:p-6">
      <Heading>{session.user.name}の日報</Heading>

      <Form action="/daily/mine" className="flex gap-x-2">
        <input type="hidden" name="tab" value={tab} />
        <DailySearchDateRangePicker />
        <Button type="submit">
          検索
          <IconSearch />
        </Button>
      </Form>

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、修正されたら Activity に変更する。
        https://github.com/vercel/next.js/issues/84489 */}
      <DailyTabs currentTab={tab}>
        <TabPanel id={DAILY_REPORT_TABS[0].id}>
          <Suspense
            key={`date-${JSON.stringify(minePageSearchParams)}`}
            fallback={<DailyTabContentSkeleton tab={DAILY_REPORT_TABS[0].id} />}
          >
            <DailyTabContent userId={session.user.id}>
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
            </DailyTabContent>
          </Suspense>
        </TabPanel>

        <TabPanel id={DAILY_REPORT_TABS[1].id}>
          <Suspense
            key={`project-${JSON.stringify(minePageSearchParams)}`}
            fallback={<DailyTabContentSkeleton tab={DAILY_REPORT_TABS[1].id} />}
          >
            <DailyTabContent userId={session.user.id}>
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
                <ProjectSummaryTable summary={data.summary} />
              ))}
            </DailyTabContent>
          </Suspense>
        </TabPanel>
      </DailyTabs>
    </div>
  )
}
