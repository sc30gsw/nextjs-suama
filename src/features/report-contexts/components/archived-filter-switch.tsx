'use client'

import type { FilterOption } from '~/components/ui/search/search-filter-radio-group'
import { SearchFilterRadioGroup } from '~/components/ui/search/search-filter-radio-group'
import { projectSearchParamsParsers } from '~/features/report-contexts/projects/types/search-params/project-search-params-cache'

const ARCHIVE_FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'すべて表示',
    description: 'すべてのプロジェクトを表示します。',
  },
  {
    value: 'active',
    label: 'アクティブのみ',
    description: 'アクティブなプロジェクトのみを表示します。',
  },
  {
    value: 'archived',
    label: 'アーカイブ済みのみ',
    description: 'アーカイブ済みプロジェクトのみを表示します。',
  },
] as const satisfies readonly FilterOption[]

export function ArchivedFilterSwitch() {
  return (
    <SearchFilterRadioGroup
      parsers={projectSearchParamsParsers}
      filterKey="archiveStatus"
      label="アーカイブ"
      options={ARCHIVE_FILTER_OPTIONS}
      defaultDescription="すべてのプロジェクトを表示します。"
    />
  )
}
