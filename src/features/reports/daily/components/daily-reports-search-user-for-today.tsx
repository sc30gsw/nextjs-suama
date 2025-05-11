'use client'

import { useQueryStates } from 'nuqs'
import { useListData } from 'react-stately'
import { TagField } from '~/components/ui/intent-ui/tag-field'
import { dailyReportForTodaySearchParamsParsers } from '~/features/reports/daily/types/search-params/daily-report-for-today-search-params-cache'

export function DailyReportsSearchUserForToday() {
  const [{ userNames }, setQuery] = useQueryStates(
    dailyReportForTodaySearchParamsParsers,
    {
      history: 'push',
      shallow: false,
    },
  )

  const selectedItems = useListData({
    initialItems: userNames.map((name, i) => ({
      id: i,
      name: name,
    })),
  })

  return (
    <TagField
      appearance="outline"
      label="ユーザー名"
      list={selectedItems}
      onItemInserted={(key) => {
        setQuery({ userNames: [...userNames, key.name] })
      }}
      onItemCleared={(key) => {
        setQuery({
          userNames: userNames.filter((name) => name !== key?.name),
        })
      }}
    />
  )
}
