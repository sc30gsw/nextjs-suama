import { IconSearch } from '@intentui/icons'
import Form from 'next/form'
import { unauthorized } from 'next/navigation'
import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import { Button } from '~/components/ui/intent-ui/button'
import { Heading } from '~/components/ui/intent-ui/heading'

import { MAX_ROWS_PER_PAGE, MIN_ROWS_PER_PAGE } from '~/constants'
import { DailySearchDateRangePicker } from '~/features/reports/daily/components/daily-search-date-range-picker'
import { MineDateTab } from '~/features/reports/daily/components/mine-date-tab'
import { MineProjectTab } from '~/features/reports/daily/components/mine-project-tab'
import { MineTabContentSkeleton } from '~/features/reports/daily/components/mine-tab-content-skeleton'
import { MineTabsNavigation } from '~/features/reports/daily/components/mine-tabs-navigation'

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

      <MineTabsNavigation
        currentTab={tab}
        startDate={startDate}
        endDate={endDate}
        rowsPerPage={rowsPerPage}
      />

      {/* TODO: React 19.2のActivity が Next.js のバージョン差異で動作しないため、条件付きレンダリングを使用。
      修正されたら Activity に変更する。
      https://github.com/vercel/next.js/issues/84489 */}
      {tab === 'date' ? (
        <Suspense
          key={`date-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
          fallback={<MineTabContentSkeleton />}
        >
          <MineDateTab
            reportsPromise={reportsPromise}
            page={page}
            rowsPerPage={rowsPerPage}
            startDate={startDate}
            endDate={endDate}
            userId={session.user.id}
          />
        </Suspense>
      ) : (
        <Suspense
          key={`project-${page}-${rowsPerPage}-${startDate?.getTime()}-${endDate?.getTime()}`}
          fallback={<MineTabContentSkeleton />}
        >
          <MineProjectTab
            summaryPromise={summaryPromise}
            page={page}
            rowsPerPage={rowsPerPage}
            startDate={startDate}
            endDate={endDate}
          />
        </Suspense>
      )}
    </div>
  )
}
