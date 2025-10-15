import Link from 'next/link'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { cn } from '~/utils/classes'
import { dateUtils } from '~/utils/date-utils'

type MineTabsNavigationProps = {
  currentTab: string
  startDate: Date | null
  endDate: Date | null
  rowsPerPage: number
}

export function MineTabsNavigation({
  currentTab,
  startDate,
  endDate,
  rowsPerPage,
}: MineTabsNavigationProps) {
  return (
    <div className="border-b">
      <nav className="flex gap-x-2" aria-label="Tabs">
        {DAILY_REPORT_MINE_TABS.map((TAB) => (
          <Link
            key={TAB.id}
            href={{
              query: {
                ...(startDate && { startDate: dateUtils.formatDateByJST(startDate) }),
                ...(endDate && { endDate: dateUtils.formatDateByJST(endDate) }),
                page: 1,
                rowsPerPage,
                tab: TAB.id,
              },
            }}
            className={cn(
              TAB.id === currentTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              'inline-flex items-center whitespace-nowrap border-b-2 px-4 py-2 font-medium text-sm transition-colors',
            )}
          >
            {TAB.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
