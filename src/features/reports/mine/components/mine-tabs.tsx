'use client'

import { useQueryStates } from 'nuqs'
import type { ReactNode } from 'react'
import { Tab, TabList, Tabs } from '~/components/ui/intent-ui/tabs'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { dailyReportForMineSearchParamsParsers } from '~/features/reports/mine/types/search-params/daily-report-for-mine-search-params'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

type MineTabsProps = {
  currentTab: (typeof DAILY_REPORT_MINE_TABS)[number]['id']
  children: ReactNode
}

const isDailyReportMineTabId = (
  key: unknown,
): key is (typeof DAILY_REPORT_MINE_TABS)[number]['id'] => {
  return DAILY_REPORT_MINE_TABS.some((tab) => tab.id === key)
}

export const MineTabs = (props: MineTabsProps) => {
  const { currentTab, children } = props

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
        if (isDailyReportMineTabId(key)) {
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
      {children}
    </Tabs>
  )
}
