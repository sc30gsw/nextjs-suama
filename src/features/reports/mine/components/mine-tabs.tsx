'use client'

import { useQueryStates } from 'nuqs'
import type { ReactNode } from 'react'
import { Tab, TabList, Tabs } from '~/components/ui/intent-ui/tabs'

import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { dailyReportForMineSearchParamsParsers } from '~/features/reports/mine/types/search-params/daily-report-for-mine-search-params'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

const INITIAL_PAGE = 1

type MineTabsProps = {
  currentTab: (typeof DAILY_REPORT_MINE_TABS)[number]['id']
  children: ReactNode
}

export function MineTabs({ currentTab, children }: MineTabsProps) {
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
        if (key !== 'date' && key !== 'project') {
          return
        }

        setQueryStates({
          tab: key,
          page: INITIAL_PAGE,
        })
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
