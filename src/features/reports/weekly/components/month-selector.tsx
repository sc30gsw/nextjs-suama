'use client'

import { useQueryStates } from 'nuqs'
import { Select } from '~/components/ui/intent-ui/select'
import { monthSelectSearchParamsParsers } from '~/features/reports/weekly/types/search-params/month-select-search-params-cache'

export function MonthSelector({ months }: Record<'months', Record<'name', number>[]>) {
  const [{ month }, setMonth] = useQueryStates(monthSelectSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  return (
    <Select
      label="週報の月を選択"
      placeholder="月を選択"
      selectedKey={month}
      onSelectionChange={(key) => setMonth({ month: Number(key) })}
      defaultSelectedKey={months[0].name}
      className="w-fit "
      labelClassName="font-bold text-base"
    >
      <Select.Trigger />
      <Select.List items={months}>
        {(item) => (
          <Select.Option id={item.name} textValue={item.name.toString()}>
            {item.name}月
          </Select.Option>
        )}
      </Select.List>
    </Select>
  )
}
