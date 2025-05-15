'use client'

import { Virtuoso } from 'react-virtuoso'
import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { LoadMoreButton } from '~/features/reports/weekly/components/load-more-button'
import { WeeklyIssuesAndSolutionsTable } from '~/features/reports/weekly/components/weekly-issues-and-solutions-table'
import { WeeklyReportsCardLoading } from '~/features/reports/weekly/components/weekly-reports-card-loading'
import { WeeklyReportsTable } from '~/features/reports/weekly/components/weekly-reports-table'
import { useWeeklyReportsQuery } from '~/features/reports/weekly/hooks/use-weekly-reports-query'

type WeeklyReportsCardProps = {
  userId: string
  startDate: string
  endDate: string
}

export function WeeklyReportsCard({
  userId,
  startDate,
  endDate,
}: WeeklyReportsCardProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useWeeklyReportsQuery({ startDate, endDate }, userId)

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
      data={data.pages.flatMap((page) => page.userList.users)}
      itemContent={(_, user) => (
        <Card>
          <Card.Header>
            {/* TODO: 実際のデータにする */}
            <Card.Title>
              ユーザーID: {user.age} ユーザー名: {user.username}
            </Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="p-4">
              <Heading level={3}>
                前週に立てた予定：総時間数: {user.age}時間
              </Heading>
            </div>
            <WeeklyReportsTable data={user.reports.lastWeekReports} />
            <div className="p-4">
              <Heading level={3}>職務内容：総時間数: {user.age}時間</Heading>
            </div>
            <WeeklyReportsTable data={user.reports.reports} />
            <div className="p-4">
              <Heading level={3}>次週の予定：総時間数: {user.age}時間</Heading>
            </div>
            <WeeklyReportsTable data={user.reports.nextWeekReports} />

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
      )}
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
