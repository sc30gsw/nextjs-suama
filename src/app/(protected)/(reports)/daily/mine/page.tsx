import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'

import { MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailyReportsTable } from '~/features/reports/daily/components/daily-reports-table'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { MineTabContentSkeleton } from '~/features/reports/daily/components/mine-tab-content-skeleton'
import { MineTabPanel } from '~/features/reports/daily/components/mine-tab-panel'
import { MineTabs } from '~/features/reports/daily/components/mine-tabs'
import { ProjectSummaryTable } from '~/features/reports/daily/components/project-summary-table'

import {
  getProjectSummaryForMine,
  getReportsForMine,
} from '~/features/reports/daily/server/fetcher'
import {
  dailyReportForMineSearchParamsCache,
  tabSearchParamsCache,
} from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import { getServerSession } from '~/lib/get-server-session'
import type { NextPageProps } from '~/types'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

export default async function MyDailyPage({
  searchParams,
}: NextPageProps<undefined, SearchParams>) {
  const session = await getServerSession()

  if (!session) {
    unauthorized()
  }

  const [{ tab }, { startDate, endDate }, { page, rowsPerPage }] = await Promise.all([
    tabSearchParamsCache.parse(searchParams),
    dailyReportForMineSearchParamsCache.parse(searchParams),
    paginationSearchParamsCache.parse(searchParams),
  ])

  const skip = page <= 1 ? 0 : (page - 1) * rowsPerPage
  const limit =
    rowsPerPage > MAX_ROWS_PER_PAGE
      ? MAX_ROWS_PER_PAGE
      : rowsPerPage < MIN_ROWS_PER_PAGE
        ? MIN_ROWS_PER_PAGE
        : rowsPerPage

  const reportsPromise = getReportsForMine(
    {
      skip,
      limit,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    },
    session.user.id,
  )

  const summaryPromise = getProjectSummaryForMine(
    {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      limit,
      skip,
    },
    session.user.id,
  )

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

      <MineTabs currentTab={tab} />

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、条件付きレンダリングを使用。
      修正されたら Activity に変更する。
      https://github.com/vercel/next.js/issues/84489 */}
      {tab === 'date' ? (
        <Suspense
          key={`date-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
          fallback={<MineTabContentSkeleton tab="date" />}
        >
          <MineTabPanel tab="date" dataPromise={reportsPromise}>
            {(data) => <DailyReportsTable<'mine'> reports={data} />}
          </MineTabPanel>
        </Suspense>
      ) : (
        <Suspense
          key={`project-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
          fallback={<MineTabContentSkeleton tab="project" />}
        >
          <MineTabPanel tab="project" dataPromise={summaryPromise}>
            {(data) => <ProjectSummaryTable summary={data.summary} />}
          </MineTabPanel>
        </Suspense>
      )}
    </div>
  )
}
