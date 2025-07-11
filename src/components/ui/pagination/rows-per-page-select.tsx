'use client'

import { useQueryStates } from 'nuqs'
import { Select } from '~/components/ui/intent-ui/select'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'

export const rowsPerPages = [
  { id: 1, rows: 10 },
  { id: 2, rows: 25 },
  { id: 3, rows: 50 },
  { id: 4, rows: 100 },
] as const satisfies readonly Record<string, number>[]

export function RowsPerPageSelect() {
  const [{ rowsPerPage }, setPagination] = useQueryStates(paginationSearchParamsParsers, {
    history: 'push',
    shallow: false,
  })

  return (
    <Select
      selectedKey={rowsPerPages.find((item) => item.rows === rowsPerPage)?.id ?? 1}
      onSelectionChange={(key) => {
        const selectedItem = rowsPerPages.find((item) => item.id === key)

        setPagination({ rowsPerPage: selectedItem?.rows ?? 10 })
      }}
      label="1ページあたりの表示件数"
      placeholder="表示件数を選択"
      className="max-w-52"
    >
      <Select.Trigger />
      <Select.List items={rowsPerPages}>
        {(item) => (
          <Select.Option id={item.id} textValue={item.rows.toString()}>
            {item.rows}
          </Select.Option>
        )}
      </Select.List>
    </Select>
  )
}
