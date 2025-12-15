import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import type { SearchParamsParsers } from '~/components/ui/search/search-filter-radio-group'

const MISSION_SORT_BY = ['name', 'status', 'projectName'] as const satisfies readonly string[]
const SORT_ORDER = ['asc', 'desc'] as const satisfies readonly string[]

export const missionSortByParser = parseAsStringLiteral(MISSION_SORT_BY)
export const sortOrderParser = parseAsStringLiteral(SORT_ORDER)

export const missionSearchParamsParsers = {
  names: parseAsArrayOf(parseAsString).withDefault([]),
  sortBy: missionSortByParser,
  sortOrder: sortOrderParser,
} as const satisfies SearchParamsParsers

export const missionSearchParamsCache = createSearchParamsCache(missionSearchParamsParsers)
