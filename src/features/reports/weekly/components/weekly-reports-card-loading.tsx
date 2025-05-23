import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

export function WeeklyReportsCardLoading() {
  return (
    <div className="max-w-screen-lg flex gap-2">
      <div className="flex-1 max-w-270">
        <Card>
          <Card.Header className="flex items-center">
            ユーザーID: <Skeleton className="h-4.5 w-60" /> ユーザー名:
            <Skeleton className="h-4.5 w-30" />
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="p-4">
              <Heading level={3} className="flex items-center">
                前週に立てた予定：総時間数:{' '}
                <Skeleton className="h-6 w-20 mx-2" />
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
      </div>
      <aside className="w-64 sticky top-20 h-fit hidden lg:block pr-4">
        <nav className="flex flex-col gap-1 text-sm">
          <Heading level={5} className="mb-2">
            On this page
          </Heading>
          <div className="flex flex-col gap-y-3 px-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        </nav>
      </aside>
    </div>
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
