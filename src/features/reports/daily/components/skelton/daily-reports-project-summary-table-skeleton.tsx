import { Card } from '~/components/ui/intent-ui/card'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'

const ROW_COUNT = 8

export function DailyReportsProjectSummaryTableSkeleton() {
  return (
    <Card className="w-full">
      <Card.Content className="p-0">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-5 w-36" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-5 w-48" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-5 w-16" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-5 w-20" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-5 w-24" />
                </th>
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: ROW_COUNT }, (_, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-36" />
                  </td>

                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-48" />
                  </td>

                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-16" />
                  </td>

                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20" />
                  </td>

                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-24" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  )
}
