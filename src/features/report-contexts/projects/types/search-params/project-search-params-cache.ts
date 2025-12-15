import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server'
import type { SearchParamsParsers } from '~/components/ui/search/search-filter-radio-group'

const PROJECT_SORT_BY = ['name', 'status', 'clientName'] as const satisfies readonly string[]
const SORT_ORDER = ['asc', 'desc'] as const satisfies readonly string[]

export const projectSortByParser = parseAsStringLiteral(PROJECT_SORT_BY)
export const sortOrderParser = parseAsStringLiteral(SORT_ORDER)

export const projectSearchParamsParsers = {
  names: parseAsArrayOf(parseAsString).withDefault([]),
  sortBy: projectSortByParser,
  sortOrder: sortOrderParser,
} as const satisfies SearchParamsParsers

export const projectSearchParamsCache = createSearchParamsCache(projectSearchParamsParsers)
