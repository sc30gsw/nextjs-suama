import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

export function WeeklyReportsCardLoading() {
  return (
    <Card>
      <Card.Header className="flex items-center">
        ユーザーID: <Skeleton className="h-4.5 w-60" /> ユーザー名:
        <Skeleton className="h-4.5 w-30" />
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="p-4">
          <Heading level={3} className="flex items-center">
            前週に立てた予定：総時間数: <Skeleton className="h-6 w-20 mx-2" />
            時間
          </Heading>
        </div>
        <WeeklyReportsTableLoading />
        <div className="p-4">
          <Heading level={3} className="flex items-center">
            職務内容：総時間数: <Skeleton className="h-6 w-20 mx-2" />
            時間
          </Heading>
        </div>
        <WeeklyReportsTableLoading />
        <div className="p-4">
          <Heading level={3} className="flex items-center">
            次週の予定：総時間数: <Skeleton className="h-6 w-20 mx-2" />
            時間
          </Heading>
        </div>
        <WeeklyReportsTableLoading />
        <div className="p-4">
          <Heading level={3}>困っていること</Heading>
        </div>
        <WeeklyIssuesAndSolutionsTableLoading />
        <div className="p-4">
          <Heading level={3}>工夫したこと</Heading>
        </div>
        <WeeklyIssuesAndSolutionsTableLoading />
      </Card.Content>
    </Card>
  )
}

function WeeklyReportsTableLoading() {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-muted">
        <tr>
          <th className="w-md p-3">プロジェクト名</th>
          <th className="w-md p-3">ミッション名</th>
          <th className="w-20 p-3">時間数</th>
          <th className="w-md p-3">職務内容</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 10 }, () => (
          <tr key={crypto.randomUUID()} className="border-b">
            <th scope="row" className="p-4">
              <Skeleton className="w-80 h-4" />
            </th>
            <th scope="row" className="p-4">
              <Skeleton className="w-80 h-4" />
            </th>
            <th scope="row" className="p-4">
              <Skeleton className="w-15 h-4" />
            </th>
            <th scope="row" className="p-4">
              <Skeleton className="w-87 h-4" />
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function WeeklyIssuesAndSolutionsTableLoading() {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-muted">
        <tr>
          <th className="w-1/2 p-3">カテゴリー名</th>
          <th className="p-3">内容</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 2 }, () => (
          <tr key={crypto.randomUUID()} className="border-b">
            <th scope="row" className="p-4">
              <Skeleton className="w-4/5 h-4" />
            </th>
            <th scope="row" className="p-4">
              <Skeleton className="w-4/5 h-4" />
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
