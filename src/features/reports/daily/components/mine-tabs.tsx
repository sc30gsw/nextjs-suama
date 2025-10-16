'use client'

import { useQueryStates } from 'nuqs'
import { Tab, TabList, Tabs } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { dailyReportForMineSearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-for-mine-search-params'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

export function MineTabs({
  currentTab,
}: {
  currentTab: (typeof DAILY_REPORT_MINE_TABS)[number]['id']
}) {
  const [, setQueryStates] = useQueryStates(
    {
      ...dailyReportForMineSearchParamsParsers,
      ...paginationSearchParamsParsers,
    },
    {
      history: 'push',
      shallow: false,
    },
  )

  return (
    <Tabs
      selectedKey={currentTab}
      onSelectionChange={(key) => {
        if (key === 'date' || key === 'project') {
          setQueryStates({
            tab: key,
            page: 1,
          })
        }
      }}
    >
      <TabList>
        {DAILY_REPORT_MINE_TABS.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            className={'selected:text-primary [&_[data-slot=selected-indicator]]:bg-primary'}
          >
            {tab.name}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}
