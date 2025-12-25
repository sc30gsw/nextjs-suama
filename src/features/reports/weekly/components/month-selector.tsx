'use client'

import { useQueryStates } from 'nuqs'
import { Select } from '~/components/ui/intent-ui/select'
import { monthSelectSearchParamsParsers } from '~/features/reports/weekly/types/search-params/month-select-search-params-cache'

type MonthItem = {
  name: number
  year: number
}

export function MonthSelector({ months }: Record<'months', MonthItem[]>) {
  const [{ month, year }, setMonthYear] = useQueryStates(monthSelectSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  // 同じ月名が複数あるかチェック
  const monthCounts = months.reduce(
    (acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const getMonthDisplayText = (item: MonthItem) => {
    const hasDuplicate = (monthCounts[item.name] ?? 0) > 1
    if (hasDuplicate) {
      return `${item.name}月(${item.year})`
    }
    return `${item.name}月`
  }

  const getMonthKey = (item: MonthItem) => `${item.name}-${item.year}`

  const selectedKey = month && year ? `${month}-${year}` : getMonthKey(months[0])

  return (
    <Select
      label="週報の月を選択"
      placeholder="月を選択"
      selectedKey={selectedKey}
      onSelectionChange={(key) => {
        const [monthStr, yearStr] = String(key).split('-')
        setMonthYear({ month: Number(monthStr), year: Number(yearStr) })
      }}
      defaultSelectedKey={getMonthKey(months[0])}
      className="w-fit [&>label]:font-bold [&>label]:text-base"
    >
      <Select.Trigger />

      <Select.Content items={months}>
        {(item) => (
          <Select.Item id={getMonthKey(item)} textValue={getMonthDisplayText(item)}>
            {getMonthDisplayText(item)}
          </Select.Item>
        )}
      </Select.Content>
    </Select>
  )
}
