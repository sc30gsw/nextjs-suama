import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { paginationSearchParamsCache } from '~/types/search-params/pagination-search-params-cache'

export function DailyReportTableSkeleton({
  isTabProject,
}: Partial<Record<'isTabProject', boolean>>) {
  const rowsPerPage = paginationSearchParamsCache.get('rowsPerPage')

  if (isTabProject) {
    return (
      <div className="relative w-full overflow-auto">
        <table className="table w-full min-w-full caption-bottom border-spacing-0 text-sm">
          <thead className="border-b">
            <tr>
              <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
                プロジェクト名
              </th>
              <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">期間</th>
              <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
                作業日数
              </th>
              <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
                合計勤務時間
              </th>
              <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
                平均作業時間
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowsPerPage }, (_, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-68" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-auto">
      <table className="table w-full min-w-full caption-bottom border-spacing-0 text-sm">
        <thead className="border-b">
          <tr>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">日付</th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
              ユーザー名
            </th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">合計時間</th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">所感</th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">
              リモート勤務
            </th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">提出</th>
            <th className="relative whitespace-nowrap px-3 py-3 text-left font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowsPerPage }, (_, i) => (
            <tr key={i} className="border-b">
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-25" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-70" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
