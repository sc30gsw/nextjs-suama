import { Card } from '~/components/ui/intent-ui/card'
import { Heading } from '~/components/ui/intent-ui/heading'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

export function WeeklyReportsCardLoading() {
  return (
    <>
      <div className="flex-1">
        <Card className="mt-2">
          <Card.Header className="flex items-center justify-between">
            <Card.Title className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              ユーザーID: <Skeleton className="h-4.5 w-60" /> ユーザー名:
              <Skeleton className="h-4.5 w-30" />
            </Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="p-4">
              <Heading level={3} className="flex items-center">
                前週に立てた予定：総時間数: <Skeleton className="mx-2 h-6 w-20" />
                時間
              </Heading>
            </div>
            <WeeklyReportsTableLoading />
            <div className="p-4">
              <Heading level={3} className="flex items-center">
                職務内容：総時間数: <Skeleton className="mx-2 h-6 w-20" />
                時間
              </Heading>
            </div>
            <WeeklyReportsTableLoading />
            <div className="p-4">
              <Heading level={3} className="flex items-center">
                次週の予定：総時間数: <Skeleton className="mx-2 h-6 w-20" />
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

      <aside className="sticky top-20 hidden h-fit w-64 pr-4 lg:block">
        <div className="flex flex-col gap-1 text-sm">
          <Heading level={5}>On this page</Heading>
          <nav className="flex h-[calc(100vh-121px)] flex-col gap-1 overflow-y-auto">
            <div className="flex flex-col gap-y-1 px-2">
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={i} className="my-1 h-4 w-25" />
              ))}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

function WeeklyReportsTableLoading() {
  return (
    <div className="relative w-full">
      <table className="table w-full table-fixed caption-bottom border-spacing-0 text-sm">
        <thead className="border-b">
          <tr>
            <th className="relative w-25 whitespace-nowrap px-3 py-3 text-left font-medium">
              プロジェクト名
            </th>
            <th className="relative w-25 whitespace-nowrap px-3 py-3 text-left font-medium">
              ミッション名
            </th>
            <th className="relative w-10 whitespace-nowrap px-3 py-3 text-left font-medium">
              時間数
            </th>
            <th className="relative w-20 whitespace-nowrap px-3 py-3 text-left font-medium">
              職務内容
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => (
            <tr key={i} className="border-b">
              <td className="wrap-break-word whitespace-normal px-3 py-3">
                <Skeleton className="h-4 w-full" />
              </td>
              <td className="wrap-break-word whitespace-normal px-3 py-3">
                <Skeleton className="h-4 w-full" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-1/3" />
              </td>
              <td className="wrap-break-word whitespace-normal px-3 py-3">
                <Skeleton className="h-4 w-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WeeklyIssuesAndSolutionsTableLoading() {
  return (
    <div className="relative w-full overflow-auto">
      <table className="table w-full min-w-full caption-bottom border-spacing-0 text-sm">
        <thead className="border-b">
          <tr>
            <th className="relative w-50 whitespace-nowrap px-3 py-3 text-left font-medium">
              カテゴリー名
            </th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">内容</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 2 }, (_, i) => (
            <tr key={i} className="border-b">
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-4/5" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-4/5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
