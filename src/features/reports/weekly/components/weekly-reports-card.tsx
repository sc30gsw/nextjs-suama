'use client'

import { Virtuoso } from 'react-virtuoso'
import { flatMap, pipe, reduce } from 'remeda'
import { Avatar } from '~/components/ui/intent-ui/avatar'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { LoadMoreButton } from '~/features/reports/weekly/components/load-more-button'
import { WeeklyIssuesAndSolutionsTable } from '~/features/reports/weekly/components/weekly-issues-and-solutions-table'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsTable } from '~/features/reports/weekly/components/weekly-reports-table'
import { useWeeklyReportsQuery } from '~/features/reports/weekly/hooks/use-weekly-reports-query'

type WeeklyReportsCardProps = {
  userId: string
  year: number
  week: number
}

export function WeeklyReportsCard({
  userId,
  year,
  week,
}: WeeklyReportsCardProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useWeeklyReportsQuery({ year, week }, userId)

  if (isLoading || !data) {
    return <WeeklyReportsCardLoading />
  }

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  return (
    <Virtuoso
      useWindowScroll={true}
      // style={{ height: '100dvh', paddingBottom: 0 }}
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
              mission && typeof mission.hours === 'number'
                ? sum + mission.hours
                : sum,
            0,
          ),
        )

        const totalNextWeekHours = pipe(
          report.nextWeekReports,
          flatMap((r) => r.weeklyReportMissions),
          reduce((sum, mission) => sum + mission.hours, 0),
        )

        return (
          <Card className="mt-2">
            <Card.Header>
              {/* TODO: 実際のデータにする */}
              <Card.Title className="flex items-center gap-2">
                <Avatar
                  initials={report.user.name.charAt(0)}
                  src={report.user.image}
                  alt={report.user.name}
                />
                ユーザーID: {report.user.id.slice(0, 15)} ユーザー名:{' '}
                {report.user.name}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="p-4">
                <Heading level={3}>
                  前週に立てた予定：総時間数: {totalLastWeekHours}時間
                </Heading>
              </div>
              <WeeklyReportsTable<'lastWeekReports'>
                data={report.lastWeekReports.flatMap(
                  (r) => r.weeklyReportMissions,
                )}
              />
              <div className="p-4">
                <Heading level={3}>
                  職務内容：総時間数: {totalThisWeekHours}時間
                </Heading>
              </div>
              {/* TODO: 日報作成機能実装後作成 */}
              {/* <WeeklyReportsTable data={user.reports.reports} /> */}
              <div className="p-4">
                <Heading level={3}>
                  次週の予定：総時間数: {totalNextWeekHours}時間
                </Heading>
              </div>
              <WeeklyReportsTable<'nextWeekReports'>
                data={report.nextWeekReports.flatMap(
                  (r) => r.weeklyReportMissions,
                )}
              />

              {/* TODO: 日報作成機能実装後作成 */}
              <div className="p-4">
                <Heading level={3}>困っていること</Heading>
              </div>
              <WeeklyIssuesAndSolutionsTable data={issuesOrSolutions} />
              <div className="p-4">
                <Heading level={3}>工夫したこと</Heading>
              </div>
              <WeeklyIssuesAndSolutionsTable data={issuesOrSolutions} />
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

const issuesOrSolutions = [
  {
    id: 1,
    name: 'John Doe',
    occupation: 'Software Engineer',
  },
  {
    id: 2,
    name: 'Jane Smith',
    occupation: 'Marketing Manager',
  },
]
