import { Card } from '~/components/ui/intent-ui/card'
import { Skeleton } from '~/components/ui/intent-ui/skeleton'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { cn } from '~/utils/classes'

const SKELETON_ROW_COUNT = 5
const PAGINATION_BUTTON_COUNT = 7
const ACTION_BUTTON_COUNT = 3

const DATE_TAB_ID = DAILY_REPORT_MINE_TABS[0].id

const DATE_TAB_WIDTHS = [
  'w-20',
  'w-28',
  'w-16',
  'w-40',
  'w-20',
  'w-16',
] as const satisfies readonly `w-${number}`[]

const PROJECT_TAB_WIDTHS = [
  'w-36',
  'w-48',
  'w-16',
  'w-20',
  'w-24',
] as const satisfies readonly `w-${number}`[]

export function MineTabContentSkeleton({
  tab,
}: Record<'tab', (typeof DAILY_REPORT_MINE_TABS)[number]['id']>) {
  const widths = tab === DATE_TAB_ID ? DATE_TAB_WIDTHS : PROJECT_TAB_WIDTHS

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
                  {widths.map((width, i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      <Skeleton className={cn('h-5', width)} />
                    </th>
                  ))}

                  {tab === DATE_TAB_ID && (
                    <th className="px-4 py-3 text-left">
                      <Skeleton className="h-5 w-auto" />
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {[...Array(SKELETON_ROW_COUNT)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b last:border-b-0">
                    {widths.map((width, colIndex) => (
                      <td key={colIndex} className="px-4 py-4">
                        <Skeleton className={`h-6 ${width}`} />
                      </td>
                    ))}

                    {tab === DATE_TAB_ID && (
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          {[...Array(ACTION_BUTTON_COUNT)].map((_, i) => (
                            <Skeleton key={i} className={i === 0 ? 'h-8 w-8' : 'h-8 w-16'} />
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
            {[...Array(PAGINATION_BUTTON_COUNT + 4)].map((_, i) => (
              <Skeleton key={i} className="size-10" />
            ))}
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}
