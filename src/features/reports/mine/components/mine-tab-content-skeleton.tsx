import { Card } from '~/components/ui/intent-ui/card'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { cn } from '~/utils/classes'

const SKELETON_ROW_COUNT = 5
const PAGINATION_TOTAL_COUNT = 11
const ACTION_BUTTON_COUNT = 3

const DATE_TAB_ID = DAILY_REPORT_MINE_TABS[0].id

export function MineTabContentSkeleton({
  tab,
}: Record<'tab', (typeof DAILY_REPORT_MINE_TABS)[number]['id']>) {
  const isDateTab = tab === DATE_TAB_ID

  return (
    <div className="space-y-3">
      <div className="flex max-w-52 flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="flex items-end justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-48" />
      </div>

      <Card className="max-w-full border-t-0 pt-0">
        <Card.Content>
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <Skeleton className={cn('h-5', isDateTab ? 'w-20' : 'w-36')} />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className={cn('h-5', isDateTab ? 'w-28' : 'w-48')} />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-16" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className={cn('h-5', isDateTab ? 'w-40' : 'w-20')} />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className={cn('h-5', isDateTab ? 'w-20' : 'w-24')} />
                  </th>
                  {isDateTab && (
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-5 w-16" />
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <Skeleton className={cn('h-6', isDateTab ? 'w-20' : 'w-36')} />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className={cn('h-6', isDateTab ? 'w-28' : 'w-48')} />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className={cn('h-6', isDateTab ? 'w-40' : 'w-20')} />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className={cn('h-6', isDateTab ? 'w-20' : 'w-24')} />
                    </td>
                    {isDateTab && (
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {Array.from({ length: ACTION_BUTTON_COUNT }, (_, i) => (
                            <Skeleton key={i} className={cn('h-8', i === 0 ? 'w-8' : 'w-16')} />
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>

        <Card.Footer>
          <div className="flex w-full items-center justify-center gap-1">
            {Array.from({ length: PAGINATION_TOTAL_COUNT }, (_, i) => (
              <Skeleton key={i} className="size-10" />
            ))}
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}
