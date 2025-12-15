'use client'

import {
  type FilterOption,
  SearchFilterRadioGroup,
} from '~/components/ui/search/search-filter-radio-group'
import { userSearchParamsParsers } from '~/features/users/types/search-params/user-search-params-cache'

const RETIREMENT_STATUS_FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'すべて表示',
    description: 'すべてのユーザーを表示します',
  },
  {
    value: 'active',
    label: '在職中のみ',
    description: '在職中のユーザーのみを表示します',
  },
  {
    value: 'retired',
    label: '退職済みのみ',
    description: '退職済みユーザーのみを表示します',
  },
] as const satisfies readonly FilterOption[]

export function RetiredFilterRadioGroup() {
  return (
    <SearchFilterRadioGroup
      parsers={userSearchParamsParsers}
      filterKey="retirementStatus"
      label="在籍状態"
      options={RETIREMENT_STATUS_FILTER_OPTIONS}
      defaultDescription="すべてのユーザーを表示します。"
    />
  )
}
