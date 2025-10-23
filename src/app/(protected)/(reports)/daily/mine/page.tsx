import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'
import { TabPanel } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_MINE_TABS, MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { MineTabContent } from '~/features/reports/mine/components/mine-tab-content'
import { MineTabContentSkeleton } from '~/features/reports/mine/components/mine-tab-content-skeleton'
import { MineTabs } from '~/features/reports/mine/components/mine-tabs'
import { ProjectSummaryTable } from '~/features/reports/mine/components/project-summary-table'
import { getProjectSummaryForMine, getReportsForMine } from '~/features/reports/mine/server/fetcher'
import { minePageSearchParamsCache } from '~/features/reports/mine/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const minePageSearchParams = await minePageSearchParamsCache.parse(searchParams)
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
      <MineTabs currentTab={tab}>
        <TabPanel id={DAILY_REPORT_MINE_TABS[0].id}>
          <Suspense
            key={`date-${JSON.stringify(minePageSearchParams)}`}
            fallback={<MineTabContentSkeleton tab={DAILY_REPORT_MINE_TABS[0].id} />}
          >
            <MineTabContent>
              {getReportsForMine(
                {
                  skip,
                  limit,
                  startDate: startDate ?? undefined,
                  endDate: endDate ?? undefined,
                },
                session.user.id,
              ).then((data) => (
                <DailyReportsTable reports={data.myReports} />
              ))}
            </MineTabContent>
          </Suspense>
        </TabPanel>

        <TabPanel id={DAILY_REPORT_MINE_TABS[1].id}>
          <Suspense
            key={`project-${JSON.stringify(minePageSearchParams)}`}
            fallback={<MineTabContentSkeleton tab={DAILY_REPORT_MINE_TABS[1].id} />}
          >
            <MineTabContent>
              {getProjectSummaryForMine(
                {
                  startDate: startDate ?? undefined,
                  endDate: endDate ?? undefined,
                  limit,
                  skip,
                },
                session.user.id,
              ).then((data) => (
                <ProjectSummaryTable summary={data.summary} />
              ))}
            </MineTabContent>
          </Suspense>
        </TabPanel>
      </MineTabs>
    </div>
  )
}
