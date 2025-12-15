'use client'

import type {
  FilterOption,
  SearchParamsParsers,
} from '~/components/ui/search/search-filter-radio-group'
import { SearchFilterRadioGroup } from '~/components/ui/search/search-filter-radio-group'
import { archiveStatusParser } from '~/features/report-contexts/types/search-params/archive-status-search-params-cache'
import { nameSearchParamsParsers } from '~/features/report-contexts/types/search-params/name-search-params-cache'

const searchParamsParsers = {
  ...nameSearchParamsParsers,
  archiveStatus: archiveStatusParser,
} as const satisfies SearchParamsParsers

type ArchiveStatusType = 'project' | 'mission'

const ARCHIVE_STATUS_DESCRIPTIONS= {
  project: {
    all: 'すべてのプロジェクトを表示します',
    active: 'アクティブなプロジェクトのみを表示します',
    archived: 'アーカイブ済みプロジェクトのみを表示します',
    default: 'すべてのプロジェクトを表示します。',
  },
  mission: {
    all: 'すべてのミッションを表示します',
    active: 'アクティブなプロジェクトのミッションのみを表示します',
    archived: 'アーカイブ済みプロジェクトのミッションのみを表示します',
    default: 'すべてのミッションを表示します。',
  },
} as const satisfies Record<
  ArchiveStatusType,
  Record<'all' | 'active' | 'archived' | 'default', string>
>

const ARCHIVE_STATUS_FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'すべて表示',
  },
  {
    value: 'active',
    label: 'アクティブのみ',
  },
  {
    value: 'archived',
    label: 'アーカイブ済みのみ',
  },
] as const satisfies readonly Omit<FilterOption, 'description'>[]

export function ArchiveStatusFilterRadioGroup<T extends ArchiveStatusType>({
  type,
}: Record<'type', T>) {
  const descriptions = ARCHIVE_STATUS_DESCRIPTIONS[type]

  const options = [
    {
      value: 'all',
      label: ARCHIVE_STATUS_FILTER_OPTIONS[0].label,
      description: descriptions.all,
    },
    {
      value: 'active',
      label: ARCHIVE_STATUS_FILTER_OPTIONS[1].label,
      description: descriptions.active,
    },
    {
      value: 'archived',
      label: ARCHIVE_STATUS_FILTER_OPTIONS[2].label,
      description: descriptions.archived,
    },
  ] as const satisfies readonly FilterOption[]

  return (
    <SearchFilterRadioGroup
      parsers={searchParamsParsers}
      filterKey="archiveStatus"
      label="アーカイブ"
      options={options}
      defaultDescription={descriptions.default}
    />
  )
}
