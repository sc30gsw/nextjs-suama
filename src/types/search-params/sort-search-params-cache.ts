import { createSearchParamsCache, parseAsStringLiteral } from 'nuqs/server'
import type { SearchParamsParsers } from '~/components/ui/search/search-filter-radio-group'

const SORT_BY = ['name', 'status'] as const satisfies readonly string[]
const SORT_ORDER = ['asc', 'desc'] as const satisfies readonly string[]

export const sortByParser = parseAsStringLiteral(SORT_BY)
export const sortOrderParser = parseAsStringLiteral(SORT_ORDER)

export const sortSearchParamsParsers = {
  sortBy: sortByParser,
  sortOrder: sortOrderParser,
} as const satisfies SearchParamsParsers

export const sortSearchParamsCache = createSearchParamsCache(sortSearchParamsParsers)
