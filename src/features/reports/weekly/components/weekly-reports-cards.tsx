import type { RefObject } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'
import { flatMap, pipe, reduce } from 'remeda'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Table } from '~/components/ui/intent-ui/table'
import { DailyReportsInWeeklyReportListTable } from '~/features/reports/weekly/components/daily-reports-in-weekly-report-list-table'
import { LoadMoreButton } from '~/features/reports/weekly/components/load-more-button'
import { WeeklyIssuesAndSolutionsTable } from '~/features/reports/weekly/components/weekly-issues-and-solutions-table'
import { WeeklyReportsTable } from '~/features/reports/weekly/components/weekly-reports-table'
import type { fetchWeeklyReportsInfiniteQuery } from '~/features/reports/weekly/queries/fetcher'

type WeeklyReportsCardsProps = {
  data: Exclude<
    ReturnType<ReturnType<typeof fetchWeeklyReportsInfiniteQuery>['use']>['data'],
    undefined
  >
  ref?: RefObject<VirtuosoHandle | null>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  loadMore: () => void
}

export function WeeklyReportsCards({
  data,
  ref,
  hasNextPage,
  isFetchingNextPage,
  loadMore,
}: WeeklyReportsCardsProps) {
  return (
    <Virtuoso
      ref={ref}
      useWindowScroll={true}
      className="min-h-dvh pb-0"
      data={data.pages.flatMap((page) => page.reports)}
      itemContent={(_, report) => {
        const totalLastWeekHours = pipe(
          report.lastWeekReports,
          flatMap((r) => r.weeklyReportMissions),
          reduce((sum, mission) => sum + mission.hours, 0),
        )

        const totalThisWeekHours = pipe(
          report.dailyReports,
          flatMap((r) => r.dailyReportMissions ?? []),
          reduce(
            (sum, mission) =>
              mission && typeof mission.hours === 'number' ? sum + mission.hours : sum,
            0,
          ),
        )

        const totalNextWeekHours = pipe(
          report.nextWeekReports,
          flatMap((r) => r.weeklyReportMissions),
          reduce((sum, mission) => sum + mission.hours, 0),
        )

        return (
          <Card id={`user-${report.user.id}`} className="mt-2">
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Avatar
                  initials={report.user.name.charAt(0)}
                  src={report.user.image}
                  alt={report.user.name}
                />
                ユーザーID: {report.user.id.slice(0, 15)} ユーザー名: {report.user.name}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="p-4">
                <Heading level={3}>前週に立てた予定：総時間数: {totalLastWeekHours}時間</Heading>
              </div>
              <WeeklyReportsTable<'lastWeekReports'>
                data={report.lastWeekReports.flatMap((r) => r.weeklyReportMissions)}
              />
              <div className="p-4">
                <Heading level={3}>職務内容：総時間数: {totalThisWeekHours}時間</Heading>
              </div>
              <DailyReportsInWeeklyReportListTable
                data={report.dailyReports.flatMap((r) => r.dailyReportMissions)}
              />
              <div className="p-4">
                <Heading level={3}>次週の予定：総時間数: {totalNextWeekHours}時間</Heading>
              </div>
              <WeeklyReportsTable<'nextWeekReports'>
                data={report.nextWeekReports.flatMap((r) => r.weeklyReportMissions)}
              />

              <div className="p-4">
                <Heading level={3}>困っていること</Heading>
              </div>
              <WeeklyIssuesAndSolutionsTable>
                <Table.Body items={report.troubles}>
                  {(item) => (
                    <Table.Row id={item.id}>
                      <Table.Cell>{item.trouble}</Table.Cell>
                      <Table.Cell>{item.categoryOfTrouble.name}</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </WeeklyIssuesAndSolutionsTable>
              <div className="p-4">
                <Heading level={3}>工夫したこと</Heading>
              </div>
              <WeeklyIssuesAndSolutionsTable>
                <Table.Body items={report.dailyReports.flatMap((r) => r.appeals)}>
                  {(item) => (
                    <Table.Row id={item.id}>
                      <Table.Cell>{item.appeal}</Table.Cell>
                      <Table.Cell>{item.categoryOfAppeal.name}</Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </WeeklyIssuesAndSolutionsTable>
            </Card.Content>
          </Card>
        )
      }}
      increaseViewportBy={200}
      components={{ Footer: hasNextPage ? LoadMoreButton : undefined }}
      context={{
        loadMore,
        loading: isFetchingNextPage,
        canLoadMore: hasNextPage,
      }}
    />
  )
}
